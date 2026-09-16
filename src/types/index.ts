// Tipos centrales de la aplicación. Reflejan el contrato esperado
// con el backend FastAPI (ver README.md, sección "Endpoints").

export type Role = "guest" | "client" | "employee" | "admin";

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  creadoEn: string;
}

export interface Product {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  precioUSD: number;
  stock: number;
  imagen: string;
  descripcionCorta: string;
  descripcionLarga: string;
  materiales: string[];
  destacado?: boolean;
}

export type EstadoPedido = "pendiente" | "enviado" | "entregado" | "cancelado";

export interface ItemPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitarioUSD: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  clienteNombre: string;
  items: ItemPedido[];
  totalUSD: number;
  estado: EstadoPedido;
  creadoEn: string;
  direccionEnvio: string;
}

export type CategoriaKB =
  | "politicas-internas"
  | "devoluciones"
  | "margenes"
  | "proveedores"
  | "atencion-cliente"
  | "escalacion"
  | "faq-publica"
  | "cuenta-cliente";

export interface ArticuloKB {
  id: string;
  titulo: string;
  categoria: CategoriaKB;
  contenido: string;
  // Roles mínimos que pueden ver este artículo.
  visiblePara: Role[];
  actualizadoEn: string;
}

export interface TicketSoporte {
  id: string;
  clienteNombre: string;
  asunto: string;
  estado: "abierto" | "en_proceso" | "resuelto";
  mensajes: { autor: string; texto: string; fecha: string }[];
}

export interface CartItem {
  producto: Product;
  cantidad: number;
}

export interface ChatMessage {
  autor: "usuario" | "bot";
  texto: string;
  fecha: string;
}
