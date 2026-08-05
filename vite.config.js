import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/** Cache-Control for static files when using `vite preview` (production build locally). */
function previewStaticCacheHeaders() {
    return {
        name: 'preview-static-cache-headers',
        configurePreviewServer: function (server) {
            server.middlewares.use(function (req, res, next) {
                var _a, _b;
                var path = (_b = (_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?')[0]) !== null && _b !== void 0 ? _b : '';
                if (path.startsWith('/assets/')) {
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                }
                else if (path === '/' || path === '/index.html') {
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
