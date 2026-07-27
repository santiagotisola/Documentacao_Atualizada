import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3017,
    strictPort: true,
    hmr: {
      protocol: 'http',
      host: 'localhost',
      port: 3017
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true,
        secure: false,
        timeout: 600000,       // 10 minutos (operações Playwright são lentas)
        proxyTimeout: 600000,  // 10 minutos no lado do proxy
      }
    }
  }
})
