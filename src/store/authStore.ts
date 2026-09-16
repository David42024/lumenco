// Store de autenticación con Zustand + persistencia en localStorage.
// Guarda el usuario y el token JWT; expone helpers de permisos por rol.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types";
import { loginRequest, registerRequest } from "@/lib/api";

// Jerarquía de roles: cada rol hereda los permisos de los anteriores.
const JERARQUIA: Role[] = ["guest", "client", "employee", "admin"];

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  role: () => Role;
  hasRole: (minimo: Role) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await loginRequest(email, password);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: err instanceof Error ? err.message : "Error al iniciar sesión" });
          throw err;
        }
      },

      register: async (nombre, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await registerRequest(nombre, email, password);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: err instanceof Error ? err.message : "Error al registrarse" });
          throw err;
        }
      },

      logout: () => set({ user: null, token: null }),
      clearError: () => set({ error: null }),

      role: () => get().user?.rol ?? "guest",

      hasRole: (minimo) => {
        const actual = get().role();
        return JERARQUIA.indexOf(actual) >= JERARQUIA.indexOf(minimo);
      },
    }),
    { name: "lumen-auth", partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);
