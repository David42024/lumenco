import type { Config } from "tailwindcss";

// Paleta de marca LUMEN & CO.: tonos cálidos, neutros y un dorado suave.
// darkMode "class" permite alternar tema desde el store de Zustand.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EF",
        sand: "#F0E9DC",
        clay: "#8C7A63",
        ink: "#2A2620",
        charcoal: "#1C1A17",
        surfaceDark: "#242019",
        gold: {
          light: "#D9C08C",
          DEFAULT: "#B8956A",
          dark: "#8F6E45",
        },
        sage: "#8A8D74",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 20px rgba(42, 38, 32, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
