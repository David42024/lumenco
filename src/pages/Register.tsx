import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setErrorLocal("");

    if (password.length < 8) {
      setErrorLocal("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setErrorLocal("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register(nombre, email, password);
      navigate("/", { replace: true });
    } catch {
      /* el error ya queda reflejado en el store */
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Crea tu cuenta</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Input label="Nombre completo" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Input label="Correo electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Contraseña" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirmar contraseña" type="password" required minLength={8} value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
        {(errorLocal || error) && <p className="text-sm text-red-500">{errorLocal || error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creando cuenta…" : "Registrarme"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60 dark:text-sand/60">
        ¿Ya tienes cuenta? <Link to="/login" className="text-gold">Ingresa</Link>
      </p>
    </div>
  );
}
