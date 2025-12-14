import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config with a proxy for /api to your backend (adjust port if needed)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5228'
    }
  }
})
