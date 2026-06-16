import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/fda': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/fda/, ''),
      },
    },
  },
})
