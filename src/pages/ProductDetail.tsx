import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { fetchProductBySlug } from "@/lib/api";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

export default function ProductDetail() {
  const { slug } = useParams();
  const [producto, setProducto] = useState<Product | null | undefined>(undefined);
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { isFavorite, toggle } = useFavoritesStore();
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    fetchProductBySlug(slug).then((p) => setProducto(p ?? null));
  }, [slug]);

  if (producto === undefined) {
    return <p className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-ink/50 dark:text-sand/50">Cargando…</p>;
  }
  if (producto === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-ink dark:text-sand">No encontramos este producto.</p>
        <Link to="/catalogo" className="mt-4 inline-block text-sm text-gold">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <img src={producto.imagen} alt={producto.nombre} className="aspect-[4/5] w-full rounded-sm object-cover" />

        <div>
          <p className="text-sm text-ink/50 dark:text-sand/50">{producto.categoria}</p>
          <h1 className="mt-1 font-display text-3xl text-ink dark:text-sand">{producto.nombre}</h1>
          <p className="mt-3 text-xl text-ink dark:text-sand">${producto.precioUSD.toFixed(2)}</p>
          <p className="mt-1 text-sm text-ink/50 dark:text-sand/50">
            {producto.stock > 0 ? `${producto.stock} unidades disponibles` : "Agotado por ahora"}
          </p>

          <p className="mt-6 text-ink/70 dark:text-sand/70">{producto.descripcionLarga}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {producto.materiales.map((m) => (
              <span key={m} className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink/60 dark:border-sand/15 dark:text-sand/60">
                {m}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-sm border border-ink/20 dark:border-sand/20">
              <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="px-3 py-2 text-ink dark:text-sand">−</button>
              <span className="w-8 text-center text-sm text-ink dark:text-sand">{cantidad}</span>
              <button onClick={() => setCantidad((c) => c + 1)} className="px-3 py-2 text-ink dark:text-sand">+</button>
            </div>

            <Button disabled={producto.stock === 0} onClick={() => addItem(producto, cantidad)}>
              <ShoppingBag size={16} /> Agregar al carrito
            </Button>

            {hasRole("client") && (
              <button
                onClick={() => toggle(producto.id)}
                aria-label="Guardar en favoritos"
                className="rounded-sm border border-ink/20 p-2.5 dark:border-sand/20"
              >
                <Heart size={16} className={isFavorite(producto.id) ? "fill-gold text-gold" : "text-ink dark:text-sand"} />
              </button>
            )}
          </div>

          <button onClick={() => navigate("/carrito")} className="mt-4 block text-sm text-ink/50 hover:text-gold dark:text-sand/50">
            Ir al carrito →
          </button>
        </div>
      </div>
    </div>
  );
}
