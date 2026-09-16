import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-sand/40 dark:border-sand/10 dark:bg-surfaceDark/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg text-ink dark:text-sand">LUMEN &amp; CO.</p>
          <p className="mt-3 text-sm text-ink/60 dark:text-sand/60">
            Piezas de decoración para hogares que prefieren lo esencial.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-ink dark:text-sand">Tienda</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/60 dark:text-sand/60">
            <li><Link to="/catalogo" className="hover:text-gold">Catálogo</Link></li>
            <li><Link to="/carrito" className="hover:text-gold">Carrito</Link></li>
            <li><Link to="/cuenta/pedidos" className="hover:text-gold">Seguimiento de pedidos</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-ink dark:text-sand">Empresa</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/60 dark:text-sand/60">
            <li><Link to="/nosotros" className="hover:text-gold">Nosotros</Link></li>
            <li><Link to="/envios" className="hover:text-gold">Envíos</Link></li>
            <li><Link to="/contacto" className="hover:text-gold">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-ink dark:text-sand">Síguenos</p>
          <div className="mt-3 flex gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full border border-ink/15 p-2 text-ink/60 hover:border-gold hover:text-gold dark:border-sand/15 dark:text-sand/60">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="Facebook" className="rounded-full border border-ink/15 p-2 text-ink/60 hover:border-gold hover:text-gold dark:border-sand/15 dark:text-sand/60">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="WhatsApp" className="rounded-full border border-ink/15 p-2 text-ink/60 hover:border-gold hover:text-gold dark:border-sand/15 dark:text-sand/60">
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-ink/10 px-4 py-5 text-center text-xs text-ink/50 dark:border-sand/10 dark:text-sand/50">
        © {new Date().getFullYear()} LUMEN &amp; CO. Todos los derechos reservados.
      </div>
    </footer>
  );
}
