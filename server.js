import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8080', 10);
const VITE_BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';

const app = express();

app.use('/api', createProxyMiddleware({ target: VITE_BACKEND_URL, changeOrigin: true }));
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
