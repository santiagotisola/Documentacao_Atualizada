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
    }
  }
})
