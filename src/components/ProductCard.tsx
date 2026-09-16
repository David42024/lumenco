import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export default function ProductCard({ producto }: { producto: Product }) {
  const { hasRole } = useAuthStore();
  const { isFavorite, toggle } = useFavoritesStore();
  const esFavorito = isFavorite(producto.id);

  return (
    <div className="group relative">
      <Link to={`/producto/${producto.slug}`} className="block overflow-hidden rounded-sm bg-sand/40 dark:bg-surfaceDark/40">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      {hasRole("client") && (
        <button
          onClick={() => toggle(producto.id)}
          aria-label="Guardar en favoritos"
          className="absolute right-2.5 top-2.5 rounded-full bg-white/85 p-1.5 backdrop-blur dark:bg-charcoal/80"
        >
          <Heart size={15} className={esFavorito ? "fill-gold text-gold" : "text-ink dark:text-sand"} />
        </button>
      )}

      <Link to={`/producto/${producto.slug}`} className="mt-3 block">
        <p className="text-sm text-ink/50 dark:text-sand/50">{producto.categoria}</p>
        <p className="mt-0.5 font-display text-base text-ink dark:text-sand">{producto.nombre}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-ink dark:text-sand">${producto.precioUSD.toFixed(2)}</span>
          <span className="text-xs text-ink/40 dark:text-sand/40">
            {producto.stock > 0 ? `${producto.stock} en stock` : "Agotado"}
          </span>
        </div>
      </Link>
    </div>
  );
}
