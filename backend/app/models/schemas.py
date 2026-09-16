"""
Pydantic schemas para request/response.
Replican exactamente los tipos del frontend (src/types/index.ts)
para que el JSON sea intercambiable sin transformaciones.
"""
from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


# ── Auth ─────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: str
    nombre: str
    email: str
    rol: str
    creadoEn: str


class AuthResponse(BaseModel):
    user: UserOut
    token: str


# ── Productos ────────────────────────────────────────────────────────


class ProductOut(BaseModel):
    id: str
    slug: str
    nombre: str
    categoria: str
    precioUSD: float
    stock: int
    imagen: str
    descripcionCorta: str
    descripcionLarga: str
    materiales: list[str]
    destacado: bool = False


class ProductCreate(BaseModel):
    slug: str
    nombre: str
    categoria: str
    precioUSD: float
    stock: int = 0
    imagen: str = ""
    descripcionCorta: str = ""
    descripcionLarga: str = ""
    materiales: list[str] = []
    destacado: bool = False


class ProductUpdate(BaseModel):
    nombre: str | None = None
    categoria: str | None = None
    precioUSD: float | None = None
    stock: int | None = None
    imagen: str | None = None
    descripcionCorta: str | None = None
    descripcionLarga: str | None = None
    materiales: list[str] | None = None
    destacado: bool | None = None


# ── Pedidos ──────────────────────────────────────────────────────────


class OrderItemOut(BaseModel):
    productoId: str
    nombre: str
    cantidad: int
    precioUnitarioUSD: float


class OrderOut(BaseModel):
    id: str
    clienteId: str
    clienteNombre: str
    items: list[OrderItemOut]
    totalUSD: float
    estado: str
    creadoEn: str
    direccionEnvio: str


class OrderItemCreate(BaseModel):
    productoId: str
    cantidad: int


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    direccionEnvio: str


class OrderStatusUpdate(BaseModel):
    estado: str


# ── Tickets de soporte ───────────────────────────────────────────────


class TicketMessageOut(BaseModel):
    autor: str
    texto: str
    fecha: str


class TicketOut(BaseModel):
    id: str
    clienteNombre: str
    asunto: str
    estado: str
    mensajes: list[TicketMessageOut]


class TicketReplyRequest(BaseModel):
    texto: str


# ── Base de conocimiento ─────────────────────────────────────────────


class KBArticleOut(BaseModel):
    id: str
    titulo: str
    categoria: str
    contenido: str
    visiblePara: list[str]
    actualizadoEn: str


class KBArticleCreate(BaseModel):
    titulo: str
    categoria: str
    contenido: str
    visiblePara: list[str] = ["admin"]


class KBArticleUpdate(BaseModel):
    titulo: str | None = None
    categoria: str | None = None
    contenido: str | None = None
    visiblePara: list[str] | None = None


# ── Chat ─────────────────────────────────────────────────────────────


class ChatRequest(BaseModel):
    message: str
    role: str = "guest"
    user_id: str | None = None


class ChatResponse(BaseModel):
    autor: str = "bot"
    texto: str
    fecha: str


# ── Admin ────────────────────────────────────────────────────────────


class AdminMetrics(BaseModel):
    ventasMes: float
    pedidosActivos: int
    usuariosRegistrados: int
    bajoStock: int


class UserUpdate(BaseModel):
    rol: str | None = None
    nombre: str | None = None
    email: str | None = None
