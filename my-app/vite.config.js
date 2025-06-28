import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
console.log('Vite config loaded!');
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensure the /api path is kept
      },
      '/uploads': {
        target: 'http://localhost:5000', // Proxy /uploads requests to the backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, '/uploads'), // Ensure the /uploads path is kept
      },
    }
  },
  optimizeDeps: {
    include: ['@paypal/react-paypal-js'],
    exclude: ['@paypal/react-paypal-js']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
})
