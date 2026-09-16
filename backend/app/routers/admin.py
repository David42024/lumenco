"""
Router de administración.
GET    /api/admin/metrics           — dashboard KPIs
GET    /api/admin/users             — lista de usuarios
PATCH  /api/admin/users/{id}        — cambiar rol/datos
DELETE /api/admin/users/{id}        — eliminar usuario
POST   /api/admin/products          — crear producto
PUT    /api/admin/products/{id}     — editar producto
DELETE /api/admin/products/{id}     — eliminar producto
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import fetch_all, fetch_one, execute
from app.dependencies import require_role
from app.models.schemas import (
    AdminMetrics,
    ProductCreate,
    ProductOut,
    ProductUpdate,
    UserOut,
    UserUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Métricas ─────────────────────────────────────────────────────────


@router.get("/metrics", response_model=AdminMetrics)
async def get_metrics(current_user: dict = Depends(require_role("admin"))):
    ventas = await fetch_one("SELECT COALESCE(SUM(total_usd), 0) AS total FROM pedidos")
    activos = await fetch_one(
        "SELECT COUNT(*) AS c FROM pedidos WHERE estado IN ('pendiente', 'enviado')"
    )
    usuarios = await fetch_one("SELECT COUNT(*) AS c FROM usuarios")
    bajo_stock = await fetch_one("SELECT COUNT(*) AS c FROM productos WHERE stock <= 6")

    return AdminMetrics(
        ventasMes=float(ventas["total"]),
        pedidosActivos=activos["c"],
        usuariosRegistrados=usuarios["c"],
        bajoStock=bajo_stock["c"],
    )


# ── Usuarios ─────────────────────────────────────────────────────────


@router.get("/users", response_model=list[UserOut])
async def list_users(current_user: dict = Depends(require_role("admin"))):
    rows = await fetch_all("SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY creado_en")
    return [
        UserOut(
            id=str(r["id"]),
            nombre=r["nombre"],
            email=r["email"],
            rol=r["rol"],
            creadoEn=r["creado_en"].strftime("%Y-%m-%d"),
        )
        for r in rows
    ]


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    body: UserUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    existing = await fetch_one("SELECT * FROM usuarios WHERE id = $1", user_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    nombre = body.nombre if body.nombre is not None else existing["nombre"]
    email = body.email if body.email is not None else existing["email"]
    rol = body.rol if body.rol is not None else existing["rol"]

    row = await fetch_one(
        """
        UPDATE usuarios SET nombre = $1, email = $2, rol = $3::rol_usuario
        WHERE id = $4
        RETURNING id, nombre, email, rol, creado_en
        """,
        nombre, email, rol, user_id,
    )
    return UserOut(
        id=str(row["id"]),
        nombre=row["nombre"],
        email=row["email"],
        rol=row["rol"],
        creadoEn=row["creado_en"].strftime("%Y-%m-%d"),
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    result = await execute("DELETE FROM usuarios WHERE id = $1", user_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")


# ── Productos (admin CRUD) ───────────────────────────────────────────


def _product_out(row) -> ProductOut:
    return ProductOut(
        id=str(row["id"]),
        slug=row["slug"],
        nombre=row["nombre"],
        categoria=row["categoria"],
        precioUSD=float(row["precio_usd"]),
        stock=row["stock"],
        imagen=row["imagen_url"] or "",
        descripcionCorta=row["descripcion_corta"] or "",
        descripcionLarga=row["descripcion_larga"] or "",
        materiales=row["materiales"] or [],
        destacado=row["destacado"],
    )


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    current_user: dict = Depends(require_role("admin")),
):
    row = await fetch_one(
        """
        INSERT INTO productos (slug, nombre, categoria, precio_usd, stock,
                               imagen_url, descripcion_corta, descripcion_larga,
                               materiales, destacado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
        """,
        body.slug, body.nombre, body.categoria, body.precioUSD, body.stock,
        body.imagen, body.descripcionCorta, body.descripcionLarga,
        body.materiales, body.destacado,
    )
    return _product_out(row)


@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    body: ProductUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    existing = await fetch_one("SELECT * FROM productos WHERE id = $1", product_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")

    nombre = body.nombre if body.nombre is not None else existing["nombre"]
    categoria = body.categoria if body.categoria is not None else existing["categoria"]
    precio = body.precioUSD if body.precioUSD is not None else existing["precio_usd"]
    stock = body.stock if body.stock is not None else existing["stock"]
    imagen = body.imagen if body.imagen is not None else existing["imagen_url"]
    desc_corta = body.descripcionCorta if body.descripcionCorta is not None else existing["descripcion_corta"]
    desc_larga = body.descripcionLarga if body.descripcionLarga is not None else existing["descripcion_larga"]
    materiales = body.materiales if body.materiales is not None else existing["materiales"]
    destacado = body.destacado if body.destacado is not None else existing["destacado"]

    row = await fetch_one(
        """
        UPDATE productos
        SET nombre = $1, categoria = $2, precio_usd = $3, stock = $4,
            imagen_url = $5, descripcion_corta = $6, descripcion_larga = $7,
            materiales = $8, destacado = $9
        WHERE id = $10
        RETURNING *
        """,
        nombre, categoria, precio, stock, imagen,
        desc_corta, desc_larga, materiales, destacado, product_id,
    )
    return _product_out(row)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    result = await execute("DELETE FROM productos WHERE id = $1", product_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
