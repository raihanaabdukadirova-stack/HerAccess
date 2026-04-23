import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Proxy /api requests to the Express backend during development
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },

  // Aliases — import from "@/components/..." instead of "../../components/..."
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
