import type { ReactNode } from "react";

const estados: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  enviado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  entregado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  abierto: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  en_proceso: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  resuelto: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function Badge({ children, tono }: { children: ReactNode; tono: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${estados[tono] ?? "bg-sand text-ink dark:bg-surfaceDark dark:text-sand"}`}>
      {children}
    </span>
  );
}
