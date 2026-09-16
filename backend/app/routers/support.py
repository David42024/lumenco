"""
Router de tickets de soporte.
GET  /api/support/tickets                — employee+
POST /api/support/tickets/{id}/reply     — employee+
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import fetch_all, fetch_one, execute
from app.dependencies import require_role
from app.models.schemas import TicketOut, TicketMessageOut, TicketReplyRequest

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/tickets", response_model=list[TicketOut])
async def list_tickets(current_user: dict = Depends(require_role("employee"))):
    rows = await fetch_all(
        """
        SELECT t.id, t.asunto, t.estado, t.creado_en, u.nombre AS cliente_nombre
        FROM tickets_soporte t JOIN usuarios u ON t.cliente_id = u.id
        ORDER BY t.creado_en DESC
        """
    )
    result = []
    for row in rows:
        msgs = await fetch_all(
            """
            SELECT COALESCE(u.nombre, 'Sistema') AS autor, tm.texto,
                   tm.creado_en AS fecha
            FROM ticket_mensajes tm LEFT JOIN usuarios u ON tm.autor_id = u.id
            WHERE tm.ticket_id = $1
            ORDER BY tm.creado_en
            """,
            row["id"],
        )
        mensajes = [
            TicketMessageOut(
                autor=m["autor"],
                texto=m["texto"],
                fecha=m["fecha"].strftime("%Y-%m-%d"),
            )
            for m in msgs
        ]
        result.append(
            TicketOut(
                id=str(row["id"]),
                clienteNombre=row["cliente_nombre"],
                asunto=row["asunto"],
                estado=row["estado"],
                mensajes=mensajes,
            )
        )
    return result


@router.post("/tickets/{ticket_id}/reply", status_code=status.HTTP_201_CREATED)
async def reply_ticket(
    ticket_id: str,
    body: TicketReplyRequest,
    current_user: dict = Depends(require_role("employee")),
):
    # Verificar que el ticket exista
    ticket = await fetch_one("SELECT id FROM tickets_soporte WHERE id = $1", ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket no encontrado.")

    await execute(
        """
        INSERT INTO ticket_mensajes (ticket_id, autor_id, texto)
        VALUES ($1, $2, $3)
        """,
        ticket_id, current_user["id"], body.texto,
    )

    # Si el ticket estaba abierto, pasarlo a en_proceso
    await execute(
        """
        UPDATE tickets_soporte SET estado = 'en_proceso'
        WHERE id = $1 AND estado = 'abierto'
        """,
        ticket_id,
    )
    return {"ok": True}
