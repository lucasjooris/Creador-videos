/**
 * Servidor del panel visual de Belga Inmobiliaria
 * Corre en http://localhost:4000
 *
 * Uso: npm run panel
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;
const OUT_DIR = path.join(__dirname, 'out');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'panel')));

// Asegurarse de que existe la carpeta out/
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

/**
 * POST /api/render
 * Body: { data: PropertyData }
 * Respuesta: Server-Sent Events con el progreso del render
 */
app.post('/api/render', (req, res) => {
  const { data } = req.body;

  if (!data || !data.imageUrl || !data.priceUSD || !data.neighborhood) {
    return res.status(400).json({ error: 'Faltan datos de la propiedad' });
  }

  const outputFile = path.join(OUT_DIR, 'property-video.mp4');
  const propsJson = JSON.stringify({ data });

  // Configurar Server-Sent Events para enviar progreso en tiempo real
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (type, message) => {
    res.write(`data: ${JSON.stringify({ type, message })}\n\n`);
  };

  send('info', 'Iniciando render...');

  const child = spawn('npx', [
    'remotion', 'render',
    'BelgaPropertyVideo',
    outputFile,
    `--props=${propsJson}`,
    '--overwrite',
  ], {
    cwd: __dirname,
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  child.stdout.on('data', (chunk) => {
    const line = chunk.toString().trim();
    if (line) send('log', line);
  });

  child.stderr.on('data', (chunk) => {
    const line = chunk.toString().trim();
    if (line) send('log', line);
  });

  child.on('close', (code) => {
    if (code === 0) {
      send('done', 'Video generado con éxito');
    } else {
      send('error', `El render falló con código ${code}`);
    }
    res.end();
  });

  req.on('close', () => {
    child.kill();
  });
});

/**
 * GET /api/download
 * Descarga el último video renderizado
 */
app.get('/api/download', (req, res) => {
  const outputFile = path.join(OUT_DIR, 'property-video.mp4');

  if (!fs.existsSync(outputFile)) {
    return res.status(404).json({ error: 'No hay ningún video renderizado todavía' });
  }

  res.download(outputFile, 'belga-propiedad.mp4');
});

app.listen(PORT, () => {
  console.log(`\n✅ Panel visual disponible en: http://localhost:${PORT}\n`);
});
