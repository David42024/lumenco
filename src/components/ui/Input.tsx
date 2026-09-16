import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink/80 dark:text-sand/80">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-sm border bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-gold ${
          error ? "border-red-400" : "border-ink/20 dark:border-sand/20"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
