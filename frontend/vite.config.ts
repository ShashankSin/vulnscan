import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "react-hook-form",
      "zod",
      "@radix-ui/react-switch",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-dropdown-menu",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
    exclude: ["@vite/client", "@vite/env"],
  },
});
