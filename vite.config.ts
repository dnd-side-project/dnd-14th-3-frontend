import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "찍어줄게",
        short_name: "찍어줄게",
        description: "사진 동행 서비스",
        theme_color: "#ffffff",
        // TODO: 서비스 icon으로 업데이트
        icons: [
          {
            src: "tmpicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "tmpicon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
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
