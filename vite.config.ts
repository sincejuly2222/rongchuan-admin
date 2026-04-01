import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@ant-design/pro-components')) {
            return 'pro';
          }

          if (id.includes('antd') || id.includes('@ant-design/icons')) {
            return 'antd';
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
