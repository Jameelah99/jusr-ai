import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://jusr-ai-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/p': {
        target: 'https://jusr-ai-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
