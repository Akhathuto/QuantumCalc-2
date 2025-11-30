import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use a relative base by default so the app works when served from a subpath
  // e.g., GitHub Pages or when the site isn't hosted at the domain root.
  base: process.env.VITE_BASE || './',
  plugins: [react()],
})
