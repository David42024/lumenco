import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, ShoppingBag, User, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";

const enlacesPublicos = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/envios", label: "Envíos" },
  { to: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const { user, logout, hasRole } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur dark:border-sand/10 dark:bg-charcoal/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl tracking-tight text-ink dark:text-sand">
          LUMEN <span className="text-gold">&amp;</span> CO.
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {enlacesPublicos.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-gold" : "text-ink/70 hover:text-ink dark:text-sand/70 dark:hover:text-sand"
                }`
              }
            >
              {e.label}
            </NavLink>
          ))}
          {hasRole("employee") && (
            <NavLink to="/panel" className="text-sm text-ink/70 hover:text-ink dark:text-sand/70 dark:hover:text-sand">
              Panel interno
            </NavLink>
          )}
          {hasRole("admin") && (
            <NavLink to="/admin" className="text-sm text-ink/70 hover:text-ink dark:text-sand/70 dark:hover:text-sand">
              Administración
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Cambiar tema"
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-sand/70 dark:hover:bg-sand/10"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link to="/carrito" aria-label="Carrito" className="relative rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-sand/70 dark:hover:bg-sand/10">
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-charcoal">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/cuenta" className="rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-sand/70 dark:hover:bg-sand/10" aria-label="Mi cuenta">
                <User size={18} />
              </Link>
              <button onClick={cerrarSesion} className="text-sm text-ink/70 hover:text-ink dark:text-sand/70 dark:hover:text-sand">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden text-sm font-medium text-ink hover:text-gold dark:text-sand md:block">
              Ingresar
            </Link>
          )}

          <button
            className="rounded-full p-2 text-ink/70 hover:bg-ink/5 dark:text-sand/70 dark:hover:bg-sand/10 md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú"
          >
            {abierto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {abierto && (
        <div className="border-t border-ink/10 px-4 pb-5 pt-2 dark:border-sand/10 md:hidden">
          <div className="flex flex-col gap-1">
            {enlacesPublicos.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                onClick={() => setAbierto(false)}
                className="rounded-sm px-2 py-2.5 text-sm text-ink/80 hover:bg-ink/5 dark:text-sand/80 dark:hover:bg-sand/10"
              >
                {e.label}
              </NavLink>
            ))}
            {hasRole("employee") && (
              <NavLink to="/panel" onClick={() => setAbierto(false)} className="rounded-sm px-2 py-2.5 text-sm text-ink/80 hover:bg-ink/5 dark:text-sand/80 dark:hover:bg-sand/10">
                Panel interno
              </NavLink>
            )}
            {hasRole("admin") && (
              <NavLink to="/admin" onClick={() => setAbierto(false)} className="rounded-sm px-2 py-2.5 text-sm text-ink/80 hover:bg-ink/5 dark:text-sand/80 dark:hover:bg-sand/10">
                Administración
              </NavLink>
            )}
            <div className="mt-2 border-t border-ink/10 pt-2 dark:border-sand/10">
              {user ? (
                <>
                  <NavLink to="/cuenta" onClick={() => setAbierto(false)} className="block rounded-sm px-2 py-2.5 text-sm text-ink/80 hover:bg-ink/5 dark:text-sand/80 dark:hover:bg-sand/10">
                    Mi cuenta
                  </NavLink>
                  <button onClick={cerrarSesion} className="block w-full rounded-sm px-2 py-2.5 text-left text-sm text-ink/80 hover:bg-ink/5 dark:text-sand/80 dark:hover:bg-sand/10">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setAbierto(false)} className="block rounded-sm px-2 py-2.5 text-sm font-medium text-gold">
                  Ingresar
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
