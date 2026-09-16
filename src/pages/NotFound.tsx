import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-5xl text-ink dark:text-sand">404</p>
      <p className="mt-3 text-ink/60 dark:text-sand/60">No encontramos la página que buscas.</p>
      <Link to="/" className="mt-6 text-sm text-gold">Volver al inicio</Link>
    </div>
  );
}
