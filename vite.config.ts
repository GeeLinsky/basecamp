import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { visualizer } from "rollup-plugin-visualizer"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist/bundle-stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
