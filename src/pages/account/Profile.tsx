import { useAuthStore } from "@/store/authStore";
import Card from "@/components/ui/Card";

export default function Profile() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Mi perfil</h1>
      <Card className="mt-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Nombre</dt>
            <dd className="mt-1 text-ink dark:text-sand">{user.nombre}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Correo</dt>
            <dd className="mt-1 text-ink dark:text-sand">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Rol</dt>
            <dd className="mt-1 capitalize text-ink dark:text-sand">{user.rol}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/40 dark:text-sand/40">Cliente desde</dt>
            <dd className="mt-1 text-ink dark:text-sand">{user.creadoEn}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
