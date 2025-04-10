import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/player": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/item": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/mob": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
