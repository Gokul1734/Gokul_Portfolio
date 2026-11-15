import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { localAdminPlugin } from "./vite-local-admin.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), localAdminPlugin(env.PORTFOLIO_ADMIN_PIN)],
    server: {
      host: "127.0.0.1",
      proxy: {
        "/api": {
          target: "https://gokul-portfolio-backend.vercel.app",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
