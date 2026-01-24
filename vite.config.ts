import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/types": resolve(__dirname, "./src/types"),
      "@/lib": resolve(__dirname, "./src/lib"),
      "@/api": resolve(__dirname, "./src/api"),
      "@/services": resolve(__dirname, "./src/services"),
      "@/store": resolve(__dirname, "./src/store"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/queries": resolve(__dirname, "./src/queries"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/pages": resolve(__dirname, "./src/pages"),
      "@/router": resolve(__dirname, "./src/router"),
      "@/assets": resolve(__dirname, "./src/assets"),
      "@assets": resolve(__dirname, "./src/assets"),
      "@public": resolve(__dirname, "./public"),
    },
  },
});
