import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 4101,
    proxy: {
      "/api": {
        target: "http://localhost:4100",
        changeOrigin: true,
      },
    },
  },
});
