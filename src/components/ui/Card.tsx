import type { ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm border border-ink/10 bg-white/60 p-5 shadow-soft dark:border-sand/10 dark:bg-surfaceDark/60 ${className}`}>
      {children}
    </div>
  );
}
