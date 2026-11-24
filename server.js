import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './api/router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5175;
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const urlObj = new URL(req.url, `http://${host}`);
  const pathname = urlObj.pathname;

  // 1. Roteamento de API REST
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }

  // 2. Servir widget.js prioritariamente
  if (pathname === '/widget.js') {
    const widgetPath = fs.existsSync(path.join(PUBLIC_DIR, 'widget.js'))
      ? path.join(PUBLIC_DIR, 'widget.js')
      : path.join(DIST_DIR, 'widget.js');

    if (fs.existsSync(widgetPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      return fs.createReadStream(widgetPath).pipe(res);
    }
  }

  // 3. Servir arquivos estáticos de dist/ (após build) ou public/
  let filePath = path.join(DIST_DIR, pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Fallback caso dist/ ainda não tenha sido gerado
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>AtendeFlow API & Server</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h2>AtendeFlow Server Operacional</h2>
        <p>A API REST e o Banco SQLite relacional estão ativos em <code>/api</code>.</p>
        <p>Para visualizar a interface completa, execute <code>npm run build</code>.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [AtendeFlow Full-Stack] Servidor HTTP e API REST rodando em http://0.0.0.0:${PORT}`);
  console.log(`📦 [SQLite] Banco de dados relacional persistente ativo.`);
});
