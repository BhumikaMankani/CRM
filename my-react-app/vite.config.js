import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        // target: "https://crm-app-mandasatechnologies.fly.dev",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
