import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Cache-Control for static files when using `vite preview` (production build locally). */
function previewStaticCacheHeaders(): Plugin {
  return {
    name: 'preview-static-cache-headers',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? '';
        if (path.startsWith('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path === '/' || path === '/index.html') {
          res.setHeader('Cache-Control', 'no-cache');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), previewStaticCacheHeaders()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
