import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if ((url === '/api/search' || url === '/api/chat') && req.method === 'POST') {
          const filePath = url === '/api/search' ? '/api/search.js' : '/api/chat.js';
          try {
            const { default: handler } = await server.ssrLoadModule(filePath);
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {};
              } catch {
                req.body = body;
              }
              res.status = (code) => { res.statusCode = code; return res; };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };
              await handler(req, res);
            });
            return;
          } catch (err) {
            console.error(`Dev server error in ${url}:`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    process.env.GEMINI_API_KEY = apiKey;
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      apiDevServerPlugin(),
    ],
  };
})