// Store de tema claro/oscuro. Persiste y aplica/quita la clase "dark"
// en <html> para que Tailwind (darkMode: "class") reaccione globalmente.
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  apply: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggle: () => {
        const next: Theme = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        get().apply();
      },
      apply: () => {
        document.documentElement.classList.toggle("dark", get().theme === "dark");
      },
    }),
    { name: "lumen-theme" }
  )
);
