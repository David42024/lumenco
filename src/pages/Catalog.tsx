import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function Catalog() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProductos(data);
      setCargando(false);
    });
  }, []);

  const categorias = useMemo(() => ["Todas", ...new Set(productos.map((p) => p.categoria))], [productos]);

  const filtrados = productos.filter((p) => {
    const coincideCategoria = categoria === "Todas" || p.categoria === categoria;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-ink dark:text-sand">Catálogo</h1>
      <p className="mt-2 text-ink/60 dark:text-sand/60">{filtrados.length} piezas disponibles</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-sand/40" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full rounded-sm border border-ink/15 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold dark:border-sand/15"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                categoria === c
                  ? "border-ink bg-ink text-cream dark:border-gold dark:bg-gold dark:text-charcoal"
                  : "border-ink/20 text-ink/60 hover:border-ink dark:border-sand/20 dark:text-sand/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="mt-16 text-center text-sm text-ink/50 dark:text-sand/50">Cargando catálogo…</p>
      ) : filtrados.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink/50 dark:text-sand/50">No encontramos productos con esos filtros.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {filtrados.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
