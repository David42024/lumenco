// Store del carrito de compras. Persiste entre sesiones (guest o autenticado).
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (producto: Product, cantidad?: number) => void;
  removeItem: (productoId: string) => void;
  setCantidad: (productoId: string, cantidad: number) => void;
  clear: () => void;
  totalUSD: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto.id === producto.id);
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
              ),
            };
          }
          return { items: [...state.items, { producto, cantidad }] };
        }),

      removeItem: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto.id !== productoId) })),

      setCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i)),
        })),

      clear: () => set({ items: [] }),

      totalUSD: () => get().items.reduce((acc, i) => acc + i.producto.precioUSD * i.cantidad, 0),
      totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: "lumen-cart" }
  )
);
