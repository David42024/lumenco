import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      /* el error ya queda reflejado en el store */
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Ingresa a tu cuenta</h1>
      <p className="mt-2 text-sm text-ink/50 dark:text-sand/50">
        Cuentas de prueba: maria@cliente.com · jorge@cliente.com · lucia@lumenco.com (empleado) · admin@lumenco.com (admin). Cualquier contraseña de 8+ caracteres.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Input label="Correo electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Contraseña" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60 dark:text-sand/60">
        ¿No tienes cuenta? <Link to="/registro" className="text-gold">Regístrate</Link>
      </p>
    </div>
  );
}
