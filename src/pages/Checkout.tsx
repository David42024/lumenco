import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Checkout simulado: en producción, este formulario debe llamar a
// POST /orders en el backend FastAPI para crear el pedido real.
export default function Checkout() {
  const { items, totalUSD, clear } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [direccion, setDireccion] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const confirmarPedido = () => {
    if (!direccion.trim()) return;
    // Aquí se llamaría a la API real: await createOrder({ items, direccion })
    setConfirmado(true);
    clear();
  };

  if (confirmado) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-ink dark:text-sand">¡Pedido confirmado!</h1>
        <p className="mt-3 text-ink/60 dark:text-sand/60">
          Te enviaremos un correo con el detalle. Puedes revisar el estado desde tu cuenta.
        </p>
        <Button className="mt-6" onClick={() => navigate("/cuenta/pedidos")}>Ver mis pedidos</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-ink dark:text-sand">Finalizar compra</h1>
      <p className="mt-2 text-sm text-ink/50 dark:text-sand/50">Comprando como {user?.nombre}</p>

      <div className="mt-8 space-y-4">
        <Input label="Dirección de envío" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Ejemplo 123, Ciudad" />
      </div>

      <div className="mt-8 rounded-sm border border-ink/10 p-5 dark:border-sand/10">
        {items.map(({ producto, cantidad }) => (
          <div key={producto.id} className="flex justify-between py-1.5 text-sm text-ink/70 dark:text-sand/70">
            <span>{producto.nombre} × {cantidad}</span>
            <span>${(producto.precioUSD * cantidad).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 font-medium text-ink dark:border-sand/10 dark:text-sand">
          <span>Total</span>
          <span>${totalUSD().toFixed(2)}</span>
        </div>
      </div>

      <Button className="mt-8 w-full" onClick={confirmarPedido} disabled={items.length === 0}>
        Confirmar pedido
      </Button>
    </div>
  );
}
