"""
Router de la base de conocimiento.
GET    /api/knowledge-base?role=       — guest+ (filtrado por visiblePara)
GET    /api/knowledge-base/all         — admin (sin filtrar)
POST   /api/knowledge-base             — admin
PUT    /api/knowledge-base/{id}        — admin
DELETE /api/knowledge-base/{id}        — admin
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import fetch_all, fetch_one, execute
from app.dependencies import get_current_user_optional, require_role
from app.models.schemas import KBArticleCreate, KBArticleOut, KBArticleUpdate

router = APIRouter(prefix="/knowledge-base", tags=["knowledge-base"])


def _kb_out(row) -> KBArticleOut:
    return KBArticleOut(
        id=str(row["id"]),
        titulo=row["titulo"],
        categoria=row["categoria"],
        contenido=row["contenido"],
        visiblePara=row["visible_para"] or [],
        actualizadoEn=row["actualizado_en"].strftime("%Y-%m-%d"),
    )


@router.get("", response_model=list[KBArticleOut])
async def list_articles(
    role: str = "guest",
    current_user: dict | None = Depends(get_current_user_optional),
):
    """Retorna artículos visibles para el rol dado.
    Si hay JWT, usa el rol del token en lugar del query param."""
    effective_role = current_user["rol"] if current_user else role
    rows = await fetch_all(
        """
        SELECT * FROM knowledge_base
        WHERE $1 = ANY(visible_para)
        ORDER BY actualizado_en DESC
        """,
        effective_role,
    )
    return [_kb_out(r) for r in rows]


@router.get("/all", response_model=list[KBArticleOut])
async def list_all_articles(
    current_user: dict = Depends(require_role("admin")),
):
    rows = await fetch_all("SELECT * FROM knowledge_base ORDER BY actualizado_en DESC")
    return [_kb_out(r) for r in rows]


@router.post("", response_model=KBArticleOut, status_code=status.HTTP_201_CREATED)
async def create_article(
    body: KBArticleCreate,
    current_user: dict = Depends(require_role("admin")),
):
    row = await fetch_one(
        """
        INSERT INTO knowledge_base (titulo, categoria, contenido, visible_para)
        VALUES ($1, $2, $3, $4::rol_usuario[])
        RETURNING *
        """,
        body.titulo,
        body.categoria,
        body.contenido,
        body.visiblePara,
    )
    return _kb_out(row)


@router.put("/{article_id}", response_model=KBArticleOut)
async def update_article(
    article_id: str,
    body: KBArticleUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    existing = await fetch_one("SELECT * FROM knowledge_base WHERE id = $1", article_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado.")

    titulo = body.titulo if body.titulo is not None else existing["titulo"]
    categoria = body.categoria if body.categoria is not None else existing["categoria"]
    contenido = body.contenido if body.contenido is not None else existing["contenido"]
    visible_para = body.visiblePara if body.visiblePara is not None else existing["visible_para"]

    row = await fetch_one(
        """
        UPDATE knowledge_base
        SET titulo = $1, categoria = $2, contenido = $3,
            visible_para = $4::rol_usuario[], actualizado_en = now()
        WHERE id = $5
        RETURNING *
        """,
        titulo, categoria, contenido, visible_para, article_id,
    )
    return _kb_out(row)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    result = await execute("DELETE FROM knowledge_base WHERE id = $1", article_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artículo no encontrado.")
