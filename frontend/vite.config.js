import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: ['osu-parking.up.railway.app'],
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },

  preview: {
    allowedHosts: ['osu-parking.up.railway.app']
  }
})