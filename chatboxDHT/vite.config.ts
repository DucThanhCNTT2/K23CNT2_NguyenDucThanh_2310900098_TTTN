import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'

dotenv.config()

const apiTarget = `http://127.0.0.1:${process.env.PORT || '5000'}`

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
          target: apiTarget,
        changeOrigin: true,
        secure: false
        },
        '/socket.io': {
          target: apiTarget,
          ws: true
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})

