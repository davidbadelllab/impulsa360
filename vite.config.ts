import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000, // Aumenta el límite a 2000kb
    outDir: 'dist',
    emptyOutDir: true,
  },
  assetsInclude: ['**/*.glb'],
  base: '/'
})
