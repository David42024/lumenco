import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { fetchProducts, createProduct, updateProduct, deleteProduct as deleteProductApi } from "@/lib/api";
import type { Product } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const productoVacio: Omit<Product, "id"> = {
  slug: "",
  nombre: "",
  categoria: "",
  precioUSD: 0,
  stock: 0,
  imagen: "https://picsum.photos/seed/nuevo-producto/800/1000",
  descripcionCorta: "",
  descripcionLarga: "",
  materiales: [],
};

// CRUD de productos. En producción, cada operación llamaría a
// POST/PUT/DELETE /admin/products/:id (ver README, tabla de endpoints).
export default function AdminProducts() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [editando, setEditando] = useState<Product | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(productoVacio);

  useEffect(() => {
    fetchProducts().then(setProductos);
  }, []);

  const iniciarEdicion = (p: Product) => {
    setEditando(p);
    setForm(p);
    setCreando(false);
  };

  const iniciarCreacion = () => {
    setCreando(true);
    setEditando(null);
    setForm(productoVacio);
  };

  const guardar = async () => {
    if (editando) {
      const updated = await updateProduct(editando.id, form);
      setProductos((prev) => prev.map((p) => (p.id === editando.id ? updated : p)));
      setEditando(null);
    } else if (creando) {
      const nuevo = await createProduct(form);
      setProductos((prev) => [nuevo, ...prev]);
      setCreando(false);
    }
  };

  const eliminar = async (id: string) => {
    await deleteProductApi(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const formularioAbierto = editando || creando;

  return (
    <div className="pb-16">
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-ink/50 dark:text-sand/50">{productos.length} productos</p>
        <Button onClick={iniciarCreacion}><Plus size={16} /> Nuevo producto</Button>
      </div>

      {formularioAbierto && (
        <Card className="mt-4">
          <p className="font-medium text-ink dark:text-sand">{editando ? "Editar producto" : "Nuevo producto"}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input label="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            <Input label="Precio (USD)" type="number" value={form.precioUSD} onChange={(e) => setForm({ ...form, precioUSD: Number(e.target.value) })} />
            <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={guardar}>Guardar</Button>
            <Button variant="secondary" onClick={() => { setEditando(null); setCreando(false); }}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Tabla desktop */}
      <div className="mt-6 hidden overflow-hidden rounded-sm border border-ink/10 dark:border-sand/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50 text-ink/70 dark:bg-surfaceDark/50 dark:text-sand/70">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 dark:divide-sand/10">
            {productos.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-ink dark:text-sand">{p.nombre}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{p.categoria}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">${p.precioUSD.toFixed(2)}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{p.stock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => iniciarEdicion(p)} aria-label="Editar" className="text-ink/50 hover:text-gold dark:text-sand/50">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => eliminar(p.id)} aria-label="Eliminar" className="text-ink/50 hover:text-red-500 dark:text-sand/50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards móvil */}
      <div className="mt-6 space-y-3 md:hidden">
        {productos.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink dark:text-sand">{p.nombre}</p>
              <div className="flex gap-3">
                <button onClick={() => iniciarEdicion(p)} aria-label="Editar" className="text-ink/50 dark:text-sand/50"><Pencil size={15} /></button>
                <button onClick={() => eliminar(p.id)} aria-label="Eliminar" className="text-ink/50 dark:text-sand/50"><Trash2 size={15} /></button>
              </div>
            </div>
            <p className="mt-1 text-sm text-ink/60 dark:text-sand/60">{p.categoria} · ${p.precioUSD.toFixed(2)} · {p.stock} en stock</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
