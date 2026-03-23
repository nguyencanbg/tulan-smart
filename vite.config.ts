import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Zalo cần base là đường dẫn tương đối
  base: "./", 
  server: {
    port: 3000
  }
});