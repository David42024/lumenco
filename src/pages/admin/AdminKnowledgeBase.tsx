import { useEffect, useMemo, useState } from "react";
import { Lock, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { fetchAllKBArticlesAdmin, createKBArticle, updateKBArticle, deleteKBArticle as deleteKBApi } from "@/lib/api";
import type { ArticuloKB, CategoriaKB, Role } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const categorias: CategoriaKB[] = [
  "politicas-internas",
  "devoluciones",
  "margenes",
  "proveedores",
  "atencion-cliente",
  "escalacion",
  "faq-publica",
  "cuenta-cliente",
];

const rolesDisponibles: Role[] = ["guest", "client", "employee", "admin"];

// CRUD de artículos de la base de conocimiento confidencial.
// En producción: GET/POST/PUT/DELETE /admin/knowledge-base (ver README).
// El campo `visiblePara` es lo que el chatbot usa para decidir si un rol
// puede recibir ese contenido en su respuesta (RAG con control de acceso).
export default function AdminKnowledgeBase() {
  const [articulos, setArticulos] = useState<ArticuloKB[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<CategoriaKB | "todas">("todas");
  const [editando, setEditando] = useState<ArticuloKB | null>(null);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    fetchAllKBArticlesAdmin().then(setArticulos);
  }, []);

  const filtrados = useMemo(
    () =>
      articulos.filter(
        (a) =>
          (categoria === "todas" || a.categoria === categoria) &&
          a.titulo.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [articulos, busqueda, categoria]
  );

  const eliminar = async (id: string) => {
    await deleteKBApi(id);
    setArticulos((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleRolVisible = async (art: ArticuloKB, rol: Role) => {
    const yaTiene = art.visiblePara.includes(rol);
    const nuevo = yaTiene ? art.visiblePara.filter((r) => r !== rol) : [...art.visiblePara, rol];
    const updated = await updateKBArticle(art.id, { visiblePara: nuevo });
    setArticulos((prev) => prev.map((a) => (a.id === art.id ? updated : a)));
    if (editando?.id === art.id) setEditando({ ...editando, visiblePara: nuevo });
  };

  const guardar = async (titulo: string, contenido: string) => {
    if (editando) {
      const updated = await updateKBArticle(editando.id, { titulo, contenido });
      setArticulos((prev) => prev.map((a) => (a.id === editando.id ? updated : a)));
      setEditando(null);
    } else if (creando) {
      const cat = categoria === "todas" ? "faq-publica" : categoria;
      const nuevo = await createKBArticle({ titulo, contenido, categoria: cat, visiblePara: ["admin"] });
      setArticulos((prev) => [nuevo, ...prev]);
      setCreando(false);
    }
  };

  return (
    <div className="pb-16">
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-sand/40" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar artículo…"
            className="w-full rounded-sm border border-ink/15 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold dark:border-sand/15"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaKB | "todas")}
          className="rounded-sm border border-ink/20 bg-transparent px-3 py-2 text-sm dark:border-sand/20"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c.replace("-", " ")}</option>
          ))}
        </select>
        <Button onClick={() => setCreando(true)}><Plus size={16} /> Nuevo artículo</Button>
      </div>

      <div className="mt-6 space-y-3">
        {filtrados.map((a) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink dark:text-sand">{a.titulo}</p>
                <p className="text-xs capitalize text-ink/40 dark:text-sand/40">{a.categoria.replace("-", " ")} · actualizado {a.actualizadoEn}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditando(a)} aria-label="Editar" className="text-ink/50 hover:text-gold dark:text-sand/50"><Pencil size={15} /></button>
                <button onClick={() => eliminar(a.id)} aria-label="Eliminar" className="text-ink/50 hover:text-red-500 dark:text-sand/50"><Trash2 size={15} /></button>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink/70 dark:text-sand/70">{a.contenido}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-ink/10 pt-3 dark:border-sand/10">
              <Lock size={12} className="text-ink/40 dark:text-sand/40" />
              <span className="text-xs text-ink/40 dark:text-sand/40">Visible para:</span>
              {rolesDisponibles.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRolVisible(a, r)}
                  className={`rounded-full px-2.5 py-0.5 text-xs capitalize ${
                    a.visiblePara.includes(r)
                      ? "bg-gold/20 text-ink dark:text-sand"
                      : "bg-ink/5 text-ink/40 dark:bg-sand/5 dark:text-sand/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {(editando || creando) && (
        <Card className="mt-6">
          <p className="font-medium text-ink dark:text-sand">{editando ? "Editar artículo" : "Nuevo artículo"}</p>
          <div className="mt-4 space-y-4">
            <Input id="kb-titulo-input" label="Título" defaultValue={editando?.titulo} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink/80 dark:text-sand/80">Contenido</label>
              <textarea id="kb-contenido-input" rows={4} defaultValue={editando?.contenido} className="rounded-sm border border-ink/20 bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-gold dark:border-sand/20" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => {
              const tituloInput = document.getElementById("kb-titulo-input") as HTMLInputElement;
              const contenidoInput = document.getElementById("kb-contenido-input") as HTMLTextAreaElement;
              guardar(tituloInput.value, contenidoInput.value);
            }}>Guardar</Button>
            <Button variant="secondary" onClick={() => { setEditando(null); setCreando(false); }}>Cancelar</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
