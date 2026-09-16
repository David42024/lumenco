import { NavLink, Outlet } from "react-router-dom";

const enlaces = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/base-conocimiento", label: "Base de conocimiento" },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-ink dark:text-sand">Administración</h1>
      <nav className="mt-4 flex gap-6 overflow-x-auto border-b border-ink/10 dark:border-sand/10">
        {enlaces.map((e) => (
          <NavLink
            key={e.to}
            to={e.to}
            end={e.end}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 pb-3 text-sm ${
                isActive ? "border-gold text-ink dark:text-sand" : "border-transparent text-ink/50 dark:text-sand/50"
              }`
            }
          >
            {e.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
