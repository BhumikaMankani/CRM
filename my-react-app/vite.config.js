import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://crm-machine-001.fly.dev/',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
