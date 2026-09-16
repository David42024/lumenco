import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchMetrics } from "@/lib/api";
import type { AdminMetrics } from "@/lib/api";
import Card from "@/components/ui/Card";

// Serie simulada de ventas de los últimos 7 días. En producción vendría
// de GET /admin/metrics/ventas (ver README).
const ventasSemana = [
  { dia: "Lun", ventas: 420 },
  { dia: "Mar", ventas: 380 },
  { dia: "Mié", ventas: 610 },
  { dia: "Jue", ventas: 290 },
  { dia: "Vie", ventas: 705 },
  { dia: "Sáb", ventas: 890 },
  { dia: "Dom", ventas: 512 },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    fetchMetrics().then(setMetrics);
  }, []);

  return (
    <div className="pb-16">
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Ventas del mes</p>
          <p className="mt-2 font-display text-2xl text-ink dark:text-sand">${metrics?.ventasMes.toFixed(2) || "0.00"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Pedidos activos</p>
          <p className="mt-2 font-display text-2xl text-ink dark:text-sand">{metrics?.pedidosActivos || 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Usuarios registrados</p>
          <p className="mt-2 font-display text-2xl text-ink dark:text-sand">{metrics?.usuariosRegistrados || 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Bajo stock</p>
          <p className="mt-2 font-display text-2xl text-ink dark:text-sand">{metrics?.bajoStock || 0}</p>
        </Card>
      </div>

      <Card className="mt-6">
        <p className="text-sm font-medium text-ink dark:text-sand">Ventas de la última semana (USD)</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventasSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="dia" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
              <Tooltip contentStyle={{ background: "#242019", border: "none", borderRadius: 4, color: "#FAF6EF" }} />
              <Bar dataKey="ventas" fill="#B8956A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
