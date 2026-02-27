import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< Updated upstream
  server: {
=======
  optimizeDeps: {
    include: ["framer-motion", "react/jsx-runtime"],
  },
  server: { 
>>>>>>> Stashed changes
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
