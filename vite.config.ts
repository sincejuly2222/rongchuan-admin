import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@ant-design/pro-components')) {
            return 'pro';
          }

          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            /\/react\//.test(id)
          ) {
            return 'react';
          }

          return undefined;
        },
      },
    },
  },
});
