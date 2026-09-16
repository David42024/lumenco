// Store de favoritos, disponible solo para usuarios autenticados (client+).
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  ids: string[];
  toggle: (productoId: string) => void;
  isFavorite: (productoId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productoId) =>
        set((state) => ({
          ids: state.ids.includes(productoId)
            ? state.ids.filter((id) => id !== productoId)
            : [...state.ids, productoId],
        })),
      isFavorite: (productoId) => get().ids.includes(productoId),
    }),
    { name: "lumen-favorites" }
  )
);
