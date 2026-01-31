import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config with a proxy for /api to your backend (adjust port if needed)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://localhost:7228',
        secure: false,  // Accept self-signed certificate in development
        changeOrigin: true
      }
    }
  }
})
