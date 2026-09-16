import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
}

const estilos = {
  primary: "bg-ink text-cream hover:bg-ink/90 dark:bg-gold dark:text-charcoal dark:hover:bg-gold-light",
  secondary: "bg-transparent border border-ink/30 text-ink hover:border-ink dark:border-sand/30 dark:text-sand dark:hover:border-sand",
  ghost: "bg-transparent text-ink hover:bg-ink/5 dark:text-sand dark:hover:bg-sand/10",
  danger: "bg-transparent border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
};

export default function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${estilos[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
