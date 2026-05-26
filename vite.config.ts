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
    }
  },
  plugins: [
    react(),
    VitePWA({
      disable: false,
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'QuantumCalc Dashboard',
        short_name: 'QuantumCalc',
        description: 'Advanced calculator and tools suite for students and engineers',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB maximum
        globIgnores: ['**/plotly-*.js', '**/mathjs-*.js', '**/vendor-*.js']
      }
    })
  ],
  build: {
    reportCompressedSize: false,
    sourcemap: false,
    cssMinify: false,
    minify: false,
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('plotly.js') || id.includes('react-plotly.js')) {
              return 'plotly';
            }
            if (id.includes('recharts') || id.includes('d3') || id.includes('victory') || id.includes('react-resize-detector')) {
              return 'recharts';
            }
            if (id.includes('mathjs')) {
              return 'mathjs';
            }
            if (id.includes('katex')) {
              return 'katex';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
