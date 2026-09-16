import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración de Vite. El puerto y el proxy de desarrollo apuntan
// hacia el backend FastAPI definido en VITE_API_URL (ver .env.example).
// El alias "@" apunta a src/ (debe coincidir con tsconfig.json > paths).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
