import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,   // 👈 ensures Vite fails if 5173 is busy (no auto-switch to 5174)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',   // 👈 your backend on port 4000
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  }
})