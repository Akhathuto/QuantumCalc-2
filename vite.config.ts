import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      clientPort: 443
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'robots.txt'],
      workbox: {
        maximumFileSizeToCacheInBytes: 15000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        short_name: 'QuantumCalc',
        name: 'QuantumCalc - Science Calculators & Worksheets',
        icons: [
          {
            src: '/icon.svg',
            type: 'image/svg+xml',
            sizes: '512x512'
          }
        ],
        start_url: '/',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        theme_color: '#0a0a0a',
        description: 'Unified Scientific Calculators & K-5 Printable Homework Worksheet Studio.'
      }
    })
  ],
  build: {
    reportCompressedSize: false,
    sourcemap: false,
    cssMinify: false,
    minify: false
  }
});
