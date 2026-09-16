"""
Pool de conexiones async a PostgreSQL con asyncpg.
Expone helpers para queries comunes y el pool global.
"""
from __future__ import annotations

import asyncpg
import ssl as _ssl

from app.config import settings

pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    """Crea el pool de conexiones. Se llama una vez en el lifespan."""
    global pool

    # NeonDB requiere SSL; asyncpg necesita un SSLContext explícito
    # cuando la URL solo dice sslmode=require.
    dsn = settings.database_url

    # asyncpg no soporta channel_binding en el DSN — lo removemos si existe.
    if "channel_binding" in dsn:
        import re
        dsn = re.sub(r"[&?]channel_binding=[^&]*", "", dsn)

    ssl_ctx = _ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = _ssl.CERT_NONE

    pool = await asyncpg.create_pool(dsn=dsn, ssl=ssl_ctx, min_size=2, max_size=10)
    return pool


async def close_pool() -> None:
    """Cierra el pool. Se llama al apagar la app."""
    global pool
    if pool:
        await pool.close()
        pool = None


def get_pool() -> asyncpg.Pool:
    """Retorna el pool activo. Lanza si aún no fue creado."""
    if pool is None:
        raise RuntimeError("El pool de base de datos no ha sido inicializado.")
    return pool


# ── Helpers de consulta ──────────────────────────────────────────────


async def fetch_one(query: str, *args) -> asyncpg.Record | None:
    """Ejecuta una query y retorna una sola fila (o None)."""
    async with get_pool().acquire() as conn:
        return await conn.fetchrow(query, *args)


async def fetch_all(query: str, *args) -> list[asyncpg.Record]:
    """Ejecuta una query y retorna todas las filas."""
    async with get_pool().acquire() as conn:
        return await conn.fetch(query, *args)


async def execute(query: str, *args) -> str:
    """Ejecuta una query de escritura (INSERT/UPDATE/DELETE)."""
    async with get_pool().acquire() as conn:
        return await conn.execute(query, *args)
