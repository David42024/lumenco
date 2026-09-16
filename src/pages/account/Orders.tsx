import { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Pedido } from "@/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export default function Orders() {
  const { user } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    if (user) fetchOrders(user.id).then(setPedidos);
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Mis pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50 dark:text-sand/50">Todavía no tienes pedidos.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {pedidos.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink dark:text-sand">Pedido {p.id}</p>
                  <p className="text-xs text-ink/50 dark:text-sand/50">{p.creadoEn}</p>
                </div>
                <Badge tono={p.estado}>{p.estado}</Badge>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-ink/70 dark:text-sand/70">
                {p.items.map((it) => (
                  <li key={it.productoId}>{it.nombre} × {it.cantidad}</li>
                ))}
              </ul>
              <p className="mt-3 text-right text-sm font-medium text-ink dark:text-sand">Total: ${p.totalUSD.toFixed(2)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
