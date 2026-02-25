import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-app-config',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = (req as { url?: string }).url?.split('?')[0];
          if (url === '/app-config' || url === '/app-config/') {
            const raw = process.env.APP_MODE;
            const mode = raw === 'PUBLIC' ? 'PUBLIC' : 'MANAGEMENT';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ mode }));
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
