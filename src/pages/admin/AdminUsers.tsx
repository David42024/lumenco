import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { fetchUsers, updateUserRole, deleteUser as deleteUserApi } from "@/lib/api";
import type { Role, User } from "@/types";
import Card from "@/components/ui/Card";

const rolesEditables: Role[] = ["client", "employee", "admin"];

// CRUD simplificado de usuarios y empleados. En producción:
// GET/PATCH/DELETE /admin/users/:id (ver README).
export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsuarios);
  }, []);

  const cambiarRol = async (id: string, rol: Role) => {
    const updated = await updateUserRole(id, rol);
    setUsuarios((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const eliminar = async (id: string) => {
    await deleteUserApi(id);
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="pb-16">
      <p className="mt-6 text-sm text-ink/50 dark:text-sand/50">{usuarios.length} cuentas registradas</p>

      <div className="mt-4 hidden overflow-hidden rounded-sm border border-ink/10 dark:border-sand/10 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/50 text-ink/70 dark:bg-surfaceDark/50 dark:text-sand/70">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Desde</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 dark:divide-sand/10">
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-ink dark:text-sand">{u.nombre}</td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.rol}
                    onChange={(e) => cambiarRol(u.id, e.target.value as Role)}
                    className="rounded-sm border border-ink/20 bg-transparent px-2 py-1 text-sm dark:border-sand/20"
                  >
                    {rolesEditables.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-ink/70 dark:text-sand/70">{u.creadoEn}</td>
                <td className="px-4 py-3">
                  <button onClick={() => eliminar(u.id)} aria-label="Eliminar usuario" className="text-ink/50 hover:text-red-500 dark:text-sand/50">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {usuarios.map((u) => (
          <Card key={u.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink dark:text-sand">{u.nombre}</p>
              <button onClick={() => eliminar(u.id)} aria-label="Eliminar" className="text-ink/50 dark:text-sand/50"><Trash2 size={15} /></button>
            </div>
            <p className="mt-1 text-sm text-ink/60 dark:text-sand/60">{u.email}</p>
            <select
              value={u.rol}
              onChange={(e) => cambiarRol(u.id, e.target.value as Role)}
              className="mt-2 rounded-sm border border-ink/20 bg-transparent px-2 py-1 text-sm dark:border-sand/20"
            >
              {rolesEditables.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Card>
        ))}
      </div>
    </div>
  );
}
