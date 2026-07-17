import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/plantnet': {
        target: 'https://my-api.plantnet.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/plantnet/, ''),
        headers: {
          'Origin': 'https://my-api.plantnet.org',
          'Referer': 'https://my-api.plantnet.org'
        }
      }
    }
  }
})
