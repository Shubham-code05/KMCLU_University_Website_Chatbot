import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/KMCLU_University_Website_Chatbot/",
  plugins: [
    react(),
    tailwindcss(),
  ],
});