import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";

export default function Cart() {
  const { items, removeItem, setCantidad, totalUSD } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const irACheckout = () => {
    // Guest debe autenticarse antes de pagar (simulación de checkout protegido).
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-ink dark:text-sand">Tu carrito está vacío.</p>
        <Link to="/catalogo" className="mt-4 inline-block text-sm text-gold">Explorar catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-ink dark:text-sand">Tu carrito</h1>

      <div className="mt-8 divide-y divide-ink/10 dark:divide-sand/10">
        {items.map(({ producto, cantidad }) => (
          <div key={producto.id} className="flex items-center gap-4 py-5">
            <img src={producto.imagen} alt={producto.nombre} className="h-20 w-16 rounded-sm object-cover" />
            <div className="flex-1">
              <p className="font-display text-ink dark:text-sand">{producto.nombre}</p>
              <p className="text-sm text-ink/50 dark:text-sand/50">${producto.precioUSD.toFixed(2)}</p>
            </div>
            <div className="flex items-center rounded-sm border border-ink/20 dark:border-sand/20">
              <button onClick={() => setCantidad(producto.id, Math.max(1, cantidad - 1))} className="px-2.5 py-1.5 text-ink dark:text-sand">−</button>
              <span className="w-8 text-center text-sm text-ink dark:text-sand">{cantidad}</span>
              <button onClick={() => setCantidad(producto.id, cantidad + 1)} className="px-2.5 py-1.5 text-ink dark:text-sand">+</button>
            </div>
            <p className="w-16 text-right text-sm text-ink dark:text-sand">${(producto.precioUSD * cantidad).toFixed(2)}</p>
            <button onClick={() => removeItem(producto.id)} aria-label="Quitar" className="text-ink/40 hover:text-red-500 dark:text-sand/40">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6 dark:border-sand/10">
        <p className="font-display text-xl text-ink dark:text-sand">Total: ${totalUSD().toFixed(2)}</p>
        <Button onClick={irACheckout}>{user ? "Ir a pagar" : "Iniciar sesión para pagar"}</Button>
      </div>
    </div>
  );
}
