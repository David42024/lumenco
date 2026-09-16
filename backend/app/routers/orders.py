"""
Router de pedidos.
GET  /api/orders          — client: sus pedidos, employee+: todos
POST /api/orders          — client+: crear pedido
PATCH /api/orders/{id}    — employee+: cambiar estado
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import fetch_all, fetch_one, execute, get_pool
from app.dependencies import get_current_user, require_role
from app.models.schemas import OrderCreate, OrderOut, OrderItemOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


def _order_out(row, items_rows) -> OrderOut:
    items = [
        OrderItemOut(
            productoId=str(ir["producto_id"]),
            nombre=ir["nombre"],
            cantidad=ir["cantidad"],
            precioUnitarioUSD=float(ir["precio_unitario_usd"]),
        )
        for ir in items_rows
    ]
    return OrderOut(
        id=str(row["id"]),
        clienteId=str(row["cliente_id"]),
        clienteNombre=row["cliente_nombre"],
        items=items,
        totalUSD=float(row["total_usd"]),
        estado=row["estado"],
        creadoEn=row["creado_en"].strftime("%Y-%m-%d"),
        direccionEnvio=row["direccion_envio"],
    )


@router.get("", response_model=list[OrderOut])
async def list_orders(
    clienteId: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    """Client ve solo sus pedidos; employee+ ve todos."""
    role = current_user["rol"]
    user_id = current_user["id"]

    if role in ("guest",):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inicia sesión para ver pedidos.")

    # Client solo puede ver los suyos
    if role == "client":
        query = """
            SELECT p.*, u.nombre AS cliente_nombre
            FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id
            WHERE p.cliente_id = $1
            ORDER BY p.creado_en DESC
        """
        rows = await fetch_all(query, user_id)
    else:
        # employee / admin ven todo o filtran por clienteId
        if clienteId:
            query = """
                SELECT p.*, u.nombre AS cliente_nombre
                FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id
                WHERE p.cliente_id = $1
                ORDER BY p.creado_en DESC
            """
            rows = await fetch_all(query, clienteId)
        else:
            query = """
                SELECT p.*, u.nombre AS cliente_nombre
                FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id
                ORDER BY p.creado_en DESC
            """
            rows = await fetch_all(query)

    # Cargar items para cada pedido
    result = []
    for row in rows:
        items_rows = await fetch_all(
            """
            SELECT pi.producto_id, pr.nombre, pi.cantidad, pi.precio_unitario_usd
            FROM pedido_items pi JOIN productos pr ON pi.producto_id = pr.id
            WHERE pi.pedido_id = $1
            """,
            row["id"],
        )
        result.append(_order_out(row, items_rows))
    return result


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreate,
    current_user: dict = Depends(require_role("client")),
):
    user_id = current_user["id"]
    pool = get_pool()

    async with pool.acquire() as conn:
        async with conn.transaction():
            # Calcular total y validar stock
            total = 0.0
            items_data = []
            for item in body.items:
                prod = await conn.fetchrow(
                    "SELECT id, nombre, precio_usd, stock FROM productos WHERE id = $1",
                    item.productoId,
                )
                if not prod:
                    raise HTTPException(404, detail=f"Producto {item.productoId} no encontrado.")
                if prod["stock"] < item.cantidad:
                    raise HTTPException(400, detail=f"Stock insuficiente para {prod['nombre']}.")

                precio = float(prod["precio_usd"])
                total += precio * item.cantidad
                items_data.append((prod["id"], prod["nombre"], item.cantidad, precio))

                # Decrementar stock
                await conn.execute(
                    "UPDATE productos SET stock = stock - $1 WHERE id = $2",
                    item.cantidad, prod["id"],
                )

            # Crear pedido
            order_row = await conn.fetchrow(
                """
                INSERT INTO pedidos (cliente_id, total_usd, direccion_envio)
                VALUES ($1, $2, $3)
                RETURNING id, cliente_id, total_usd, estado, direccion_envio, creado_en
                """,
                user_id, total, body.direccionEnvio,
            )

            # Insertar items
            for prod_id, nombre, cantidad, precio in items_data:
                await conn.execute(
                    """
                    INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario_usd)
                    VALUES ($1, $2, $3, $4)
                    """,
                    order_row["id"], prod_id, cantidad, precio,
                )

    # Leer el pedido completo para retornar
    full_row = await fetch_one(
        """
        SELECT p.*, u.nombre AS cliente_nombre
        FROM pedidos p JOIN usuarios u ON p.cliente_id = u.id
        WHERE p.id = $1
        """,
        order_row["id"],
    )
    items_rows = await fetch_all(
        """
        SELECT pi.producto_id, pr.nombre, pi.cantidad, pi.precio_unitario_usd
        FROM pedido_items pi JOIN productos pr ON pi.producto_id = pr.id
        WHERE pi.pedido_id = $1
        """,
        order_row["id"],
    )
    return _order_out(full_row, items_rows)


@router.patch("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    current_user: dict = Depends(require_role("employee")),
):
    result = await execute(
        "UPDATE pedidos SET estado = $1::estado_pedido WHERE id = $2",
        body.estado, order_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado.")
