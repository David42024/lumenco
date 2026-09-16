import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-2xl text-ink dark:text-sand">Acceso restringido</p>
      <p className="mt-3 text-ink/60 dark:text-sand/60">Tu cuenta no tiene permisos para ver esta sección.</p>
      <Link to="/" className="mt-6 text-sm text-gold">Volver al inicio</Link>
    </div>
  );
}
