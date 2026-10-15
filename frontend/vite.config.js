import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/customers': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/wishlist': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/cart': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/customers': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/wishlist': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/cart': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
