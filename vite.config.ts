import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['mhchemparser'],
  },
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
      "/friends": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/chat": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/event": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/guild": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/profession": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/talent": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
