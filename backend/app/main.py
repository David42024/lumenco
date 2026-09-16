"""
Punto de entrada de la aplicación FastAPI.
Configura CORS, lifespan (pool de BD) y monta todos los routers.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_pool, close_pool

from app.routers import auth, products, orders, support, knowledge_base, chat, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea el pool de conexiones al iniciar, lo cierra al apagar."""
    await create_pool()
    yield
    await close_pool()


app = FastAPI(
    title="LUMEN & CO. API",
    description="Backend para el e-commerce de decoración y hogar LUMEN & CO.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(knowledge_base.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


# ── Health check ─────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "lumen-co-backend"}
