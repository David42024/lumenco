import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function Favorites() {
  const { ids } = useFavoritesStore();
  const [productos, setProductos] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then((data) => setProductos(data.filter((p) => ids.includes(p.id))));
  }, [ids]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Mis favoritos</h1>
      {productos.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50 dark:text-sand/50">Aún no guardaste ningún producto.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
