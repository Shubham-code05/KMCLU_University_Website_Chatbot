import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",   // 🔥 ye change important hai
  plugins: [
    react(),
    tailwindcss(),
  ],
});