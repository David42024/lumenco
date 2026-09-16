"""
Router de productos (público).
GET /api/products
GET /api/products/{slug}
"""
from fastapi import APIRouter, HTTPException, status

from app.database import fetch_all, fetch_one
from app.models.schemas import ProductOut

router = APIRouter(prefix="/products", tags=["products"])


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


@router.get("", response_model=list[ProductOut])
async def list_products():
    rows = await fetch_all("SELECT * FROM productos ORDER BY creado_en DESC")
    return [_product_out(r) for r in rows]


@router.get("/{slug}", response_model=ProductOut)
async def get_product(slug: str):
    row = await fetch_one("SELECT * FROM productos WHERE slug = $1", slug)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return _product_out(row)
