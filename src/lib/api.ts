// Cliente HTTP centralizado. Cuando VITE_USE_MOCK="true" (valor por defecto
// en desarrollo), las funciones devuelven datos de src/mockData.ts con una
// pequeña latencia simulada. Cuando el backend FastAPI esté listo, basta con
// poner VITE_USE_MOCK="false" en el .env: las mismas funciones empezarán a
// llamar a los endpoints reales sin tocar ningún componente.
import axios from "axios";
import type { ArticuloKB, ChatMessage, Pedido, Product, Role, TicketSoporte, User } from "@/types";
import { mockKBArticles, mockOrders, mockProducts, mockTickets, mockUsers } from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const http = axios.create({ baseURL: BASE_URL });

// Adjunta el token JWT guardado en el authStore a cada request saliente.
http.interceptors.request.use((config) => {
  const raw = localStorage.getItem("lumen-auth");
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {
      /* noop */
    }
  }
  return config;
});

const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// ---------- Productos ----------
export async function fetchProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await wait();
    return mockProducts;
  }
  const { data } = await http.get<Product[]>("/products");
  return data;
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  if (USE_MOCK) {
    await wait();
    return mockProducts.find((p) => p.slug === slug);
  }
  const { data } = await http.get<Product>(`/products/${slug}`);
  return data;
}

// ---------- Autenticación ----------
export async function loginRequest(email: string, password: string): Promise<{ user: User; token: string }> {
  if (USE_MOCK) {
    await wait();
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || password.length < 8) {
      throw new Error("Credenciales inválidas. Verifica tu correo y contraseña.");
    }
    return { user: found, token: `mock-jwt-${found.id}` };
  }
  const { data } = await http.post("/auth/login", { email, password });
  return data;
}

export async function registerRequest(nombre: string, email: string, password: string): Promise<{ user: User; token: string }> {
  if (USE_MOCK) {
    await wait();
    if (mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Ya existe una cuenta registrada con ese correo.");
    }
    const nuevo: User = {
      id: `u${Math.random().toString(36).slice(2, 7)}`,
      nombre,
      email,
      rol: "client",
      creadoEn: new Date().toISOString().slice(0, 10),
    };
    return { user: nuevo, token: `mock-jwt-${nuevo.id}` };
  }
  const { data } = await http.post("/auth/register", { nombre, email, password });
  return data;
}

// ---------- Pedidos ----------
export async function fetchOrders(clienteId?: string): Promise<Pedido[]> {
  if (USE_MOCK) {
    await wait();
    return clienteId ? mockOrders.filter((o) => o.clienteId === clienteId) : mockOrders;
  }
  const { data } = await http.get<Pedido[]>("/orders", { params: { clienteId } });
  return data;
}

export async function updateOrderStatus(orderId: string, estado: Pedido["estado"]): Promise<void> {
  if (USE_MOCK) {
    await wait();
    const order = mockOrders.find((o) => o.id === orderId);
    if (order) order.estado = estado;
    return;
  }
  await http.patch(`/orders/${orderId}`, { estado });
}

// ---------- Tickets de soporte ----------
export async function fetchTickets(): Promise<TicketSoporte[]> {
  if (USE_MOCK) {
    await wait();
    return mockTickets;
  }
  const { data } = await http.get<TicketSoporte[]>("/support/tickets");
  return data;
}

// ---------- Base de conocimiento ----------
export async function fetchKBArticles(role: Role): Promise<ArticuloKB[]> {
  if (USE_MOCK) {
    await wait();
    return mockKBArticles.filter((a) => a.visiblePara.includes(role));
  }
  const { data } = await http.get<ArticuloKB[]>("/knowledge-base", { params: { role } });
  return data;
}

export async function fetchAllKBArticlesAdmin(): Promise<ArticuloKB[]> {
  if (USE_MOCK) {
    await wait();
    return mockKBArticles;
  }
  const { data } = await http.get<ArticuloKB[]>("/knowledge-base/all");
  return data;
}

// ---------- Chatbot ----------
// Contrato esperado del backend: POST /chat { message, role, user_id }
// El backend debe hacer RAG contra la base de conocimiento, filtrando
// los artículos según `role` ANTES de pasarlos al LLM (nunca confiar en
// el rol declarado por el cliente sin validarlo también server-side).
export async function sendChatMessage(message: string, role: Role, userId?: string): Promise<ChatMessage> {
  if (USE_MOCK) {
    await wait(500);
    const visibles = mockKBArticles.filter((a) => a.visiblePara.includes(role));
    const match = visibles.find((a) =>
      message.toLowerCase().split(" ").some((word) => word.length > 3 && a.titulo.toLowerCase().includes(word))
    );
    const texto = match
      ? `Según nuestra base de conocimiento — "${match.titulo}": ${match.contenido}`
      : "No tengo acceso a esa información con tu nivel de permisos actual, o no encontré un artículo relacionado. ¿Quieres que te ponga en contacto con soporte?";
    return { autor: "bot", texto, fecha: new Date().toISOString() };
  }
  const { data } = await http.post<ChatMessage>("/chat", { message, role, user_id: userId });
  return data;
}

// ---------- Métricas ----------
export interface AdminMetrics {
  ventasMes: number;
  pedidosActivos: number;
  usuariosRegistrados: number;
  bajoStock: number;
}
export async function fetchMetrics(): Promise<AdminMetrics> {
  if (USE_MOCK) {
    await wait();
    return { ventasMes: 15400.5, pedidosActivos: 12, usuariosRegistrados: mockUsers.length, bajoStock: mockProducts.filter(p => p.stock <= 6).length };
  }
  const { data } = await http.get<AdminMetrics>("/admin/metrics");
  return data;
}

// ---------- Usuarios ----------
export async function fetchUsers(): Promise<User[]> {
  if (USE_MOCK) {
    await wait();
    return mockUsers;
  }
  const { data } = await http.get<User[]>("/admin/users");
  return data;
}
export async function updateUserRole(userId: string, rol: Role): Promise<User> {
  if (USE_MOCK) {
    await wait();
    const user = mockUsers.find(u => u.id === userId)!;
    user.rol = rol;
    return user;
  }
  const { data } = await http.patch<User>(`/admin/users/${userId}`, { rol });
  return data;
}
export async function deleteUser(userId: string): Promise<void> {
  if (USE_MOCK) {
    await wait();
    const idx = mockUsers.findIndex(u => u.id === userId);
    if (idx !== -1) mockUsers.splice(idx, 1);
    return;
  }
  await http.delete(`/admin/users/${userId}`);
}

// ---------- Admin Productos ----------
export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  if (USE_MOCK) {
    await wait();
    const nuevo = { ...product, id: `p${Math.random().toString(36).slice(2, 7)}` } as Product;
    mockProducts.push(nuevo);
    return nuevo;
  }
  const { data } = await http.post<Product>("/admin/products", product);
  return data;
}
export async function updateProduct(productId: string, product: Partial<Product>): Promise<Product> {
  if (USE_MOCK) {
    await wait();
    const existing = mockProducts.find(p => p.id === productId)!;
    Object.assign(existing, product);
    return existing;
  }
  const { data } = await http.put<Product>(`/admin/products/${productId}`, product);
  return data;
}
export async function deleteProduct(productId: string): Promise<void> {
  if (USE_MOCK) {
    await wait();
    const idx = mockProducts.findIndex(p => p.id === productId);
    if (idx !== -1) mockProducts.splice(idx, 1);
    return;
  }
  await http.delete(`/admin/products/${productId}`);
}

// ---------- Admin KB ----------
export async function createKBArticle(article: Omit<ArticuloKB, "id" | "actualizadoEn">): Promise<ArticuloKB> {
  if (USE_MOCK) {
    await wait();
    const nuevo: ArticuloKB = { ...article, id: `kb${Math.random().toString(36).slice(2, 7)}`, actualizadoEn: new Date().toISOString().slice(0, 10) };
    mockKBArticles.push(nuevo);
    return nuevo;
  }
  const { data } = await http.post<ArticuloKB>("/knowledge-base", article);
  return data;
}
export async function updateKBArticle(articleId: string, article: Partial<ArticuloKB>): Promise<ArticuloKB> {
  if (USE_MOCK) {
    await wait();
    const existing = mockKBArticles.find(a => a.id === articleId)!;
    Object.assign(existing, article);
    return existing;
  }
  const { data } = await http.put<ArticuloKB>(`/knowledge-base/${articleId}`, article);
  return data;
}
export async function deleteKBArticle(articleId: string): Promise<void> {
  if (USE_MOCK) {
    await wait();
    const idx = mockKBArticles.findIndex(a => a.id === articleId);
    if (idx !== -1) mockKBArticles.splice(idx, 1);
    return;
  }
  await http.delete(`/knowledge-base/${articleId}`);
}
