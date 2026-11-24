import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'atendeflow-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const { handleApiRequest } = await import('./api/router.js');
            return handleApiRequest(req, res);
          }
          next();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5175,
  }
});
