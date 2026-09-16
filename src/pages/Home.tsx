import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [destacados, setDestacados] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then((productos) => setDestacados(productos.filter((p) => p.destacado)));
  }, []);

  return (
    <div>
      <section className="border-b border-ink/10 dark:border-sand/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-widest text-gold">Colección permanente</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink dark:text-sand md:text-5xl">
              Objetos que envejecen bien, para casas que no siguen tendencias.
            </h1>
            <p className="mt-5 max-w-md text-ink/60 dark:text-sand/60">
              Seleccionamos piezas de cerámica, madera y textil natural, hechas por talleres pequeños que cuidan cada detalle. Nada de decoración de temporada.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/catalogo" className="rounded-sm bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90 dark:bg-gold dark:text-charcoal">
                Ver catálogo
              </Link>
              <Link to="/nosotros" className="rounded-sm border border-ink/30 px-6 py-3 text-sm font-medium text-ink hover:border-ink dark:border-sand/30 dark:text-sand">
                Nuestra historia
              </Link>
            </div>
          </div>
          <img
            src="https://picsum.photos/seed/lumen-hero/900/700"
            alt="Sala de estar decorada con piezas LUMEN & CO."
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink dark:text-sand">Piezas destacadas</h2>
          <Link to="/catalogo" className="text-sm text-ink/60 hover:text-gold dark:text-sand/60">
            Ver todo →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {destacados.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>

      <section className="bg-sand/40 py-16 dark:bg-surfaceDark/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 text-center sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="font-display text-lg text-ink dark:text-sand">Materiales nobles</p>
            <p className="mt-2 text-sm text-ink/60 dark:text-sand/60">Madera maciza, cerámica, lino y fibras naturales.</p>
          </div>
          <div>
            <p className="font-display text-lg text-ink dark:text-sand">Talleres pequeños</p>
            <p className="mt-2 text-sm text-ink/60 dark:text-sand/60">Trabajamos con artesanos y productores locales.</p>
          </div>
          <div>
            <p className="font-display text-lg text-ink dark:text-sand">Envío cuidado</p>
            <p className="mt-2 text-sm text-ink/60 dark:text-sand/60">Empaque protegido para que cada pieza llegue perfecta.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
