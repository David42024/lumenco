import { NavLink, Outlet } from "react-router-dom";

const enlaces = [
  { to: "/cuenta", label: "Perfil", end: true },
  { to: "/cuenta/pedidos", label: "Pedidos" },
  { to: "/cuenta/favoritos", label: "Favoritos" },
];

export default function AccountLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
      <nav className="flex gap-6 border-b border-ink/10 dark:border-sand/10">
        {enlaces.map((e) => (
          <NavLink
            key={e.to}
            to={e.to}
            end={e.end}
            className={({ isActive }) =>
              `border-b-2 pb-3 text-sm ${
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
