import { useEffect, useState } from "react";
import { fetchOrders, fetchProducts, fetchTickets, updateOrderStatus } from "@/lib/api";
import type { EstadoPedido, Pedido, Product, TicketSoporte } from "@/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

type Tab = "pedidos" | "tickets" | "inventario";

const siguienteEstado: Record<EstadoPedido, EstadoPedido | null> = {
  pendiente: "enviado",
  enviado: "entregado",
  entregado: null,
  cancelado: null,
};

export default function EmployeeDashboard() {
  const [tab, setTab] = useState<Tab>("pedidos");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);

  useEffect(() => {
    fetchOrders().then(setPedidos);
    fetchTickets().then(setTickets);
    fetchProducts().then(setProductos);
  }, []);

  const avanzarEstado = async (pedido: Pedido) => {
    const siguiente = siguienteEstado[pedido.estado];
    if (!siguiente) return;
    await updateOrderStatus(pedido.id, siguiente);
    setPedidos((prev) => prev.map((p) => (p.id === pedido.id ? { ...p, estado: siguiente } : p)));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Panel interno</h1>
      <p className="mt-1 text-sm text-ink/50 dark:text-sand/50">Gestión de pedidos, soporte e inventario. Los precios son de solo lectura para tu rol.</p>

      <div className="mt-6 flex gap-2 border-b border-ink/10 dark:border-sand/10">
        {(["pedidos", "tickets", "inventario"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-1 pb-3 text-sm capitalize ${
              tab === t ? "border-gold text-ink dark:text-sand" : "border-transparent text-ink/50 dark:text-sand/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "pedidos" && (
        <>
          {/* Tabla en desktop */}
          <div className="mt-6 hidden overflow-hidden rounded-sm border border-ink/10 dark:border-sand/10 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand/50 text-ink/70 dark:bg-surfaceDark/50 dark:text-sand/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 dark:divide-sand/10">
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-ink dark:text-sand">{p.id}</td>
                    <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{p.clienteNombre}</td>
                    <td className="px-4 py-3 text-ink/70 dark:text-sand/70">${p.totalUSD.toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge tono={p.estado}>{p.estado}</Badge></td>
                    <td className="px-4 py-3">
                      {siguienteEstado[p.estado] ? (
                        <button onClick={() => avanzarEstado(p)} className="text-xs text-gold hover:underline">
                          Marcar como {siguienteEstado[p.estado]}
                        </button>
                      ) : (
                        <span className="text-xs text-ink/30 dark:text-sand/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards en móvil */}
          <div className="mt-6 space-y-3 md:hidden">
            {pedidos.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink dark:text-sand">{p.id}</p>
                  <Badge tono={p.estado}>{p.estado}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink/60 dark:text-sand/60">{p.clienteNombre} — ${p.totalUSD.toFixed(2)}</p>
                {siguienteEstado[p.estado] && (
                  <button onClick={() => avanzarEstado(p)} className="mt-2 text-xs text-gold hover:underline">
                    Marcar como {siguienteEstado[p.estado]}
                  </button>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "tickets" && (
        <div className="mt-6 space-y-4">
          {tickets.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink dark:text-sand">{t.asunto}</p>
                <Badge tono={t.estado}>{t.estado.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink/50 dark:text-sand/50">Cliente: {t.clienteNombre}</p>
              <div className="mt-3 space-y-2 border-t border-ink/10 pt-3 dark:border-sand/10">
                {t.mensajes.map((m, i) => (
                  <p key={i} className="text-sm text-ink/70 dark:text-sand/70">
                    <span className="font-medium text-ink dark:text-sand">{m.autor}:</span> {m.texto}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "inventario" && (
        <div className="mt-6 hidden overflow-hidden rounded-sm border border-ink/10 dark:border-sand/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/50 text-ink/70 dark:bg-surfaceDark/50 dark:text-sand/70">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 dark:divide-sand/10">
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-ink dark:text-sand">{p.nombre}</td>
                  <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{p.categoria}</td>
                  <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{p.stock} unidades</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "inventario" && (
        <div className="mt-6 space-y-3 md:hidden">
          {productos.map((p) => (
            <Card key={p.id}>
              <p className="font-medium text-ink dark:text-sand">{p.nombre}</p>
              <p className="text-sm text-ink/60 dark:text-sand/60">{p.categoria} — {p.stock} unidades</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
