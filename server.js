/**
 * Servidor del panel visual de Belga Inmobiliaria
 * Corre en http://localhost:4000
 *
 * Uso: npm run panel
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const OUT_DIR = path.join(__dirname, 'out');
const CHROME_EXECUTABLE = process.env.REMOTION_CHROMIUM_EXECUTABLE || undefined;

app.use(cors());
app.use(express.json());

// ── Protección con contraseña ─────────────────────────────────────────────
const PANEL_PASSWORD = process.env.PANEL_PASSWORD;

if (PANEL_PASSWORD) {
  app.use((req, res, next) => {
    if (req.path === '/api/login') return next();
    const token = req.headers['x-panel-token'] || req.query.token || '';
    if (token === PANEL_PASSWORD) return next();
    res.status(401).json({ error: 'No autorizado' });
  });
}

app.use(express.static(path.join(__dirname, 'panel')));

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!PANEL_PASSWORD || password === PANEL_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Bundle cacheado para no recompilar en cada render
let cachedBundleUrl = null;

/**
 * POST /api/render
 * Body: { data: PropertyData }
 * Respuesta: Server-Sent Events con progreso en tiempo real
 */
app.post('/api/render', async (req, res) => {
  const { data } = req.body;

  if (!data || !data.imageUrl || !data.priceUSD || !data.neighborhood) {
    return res.status(400).json({ error: 'Faltan datos de la propiedad' });
  }

  // Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (type, message) => {
    res.write(`data: ${JSON.stringify({ type, message })}\n\n`);
  };

  try {
    // Importar la API programática de Remotion
    const { bundle } = require('@remotion/bundler');
    const { renderMedia, selectComposition } = require('@remotion/renderer');

    // ── Paso 1: Bundlear el proyecto (cacheado después del primero) ──
    if (!cachedBundleUrl) {
      send('log', 'Compilando el proyecto...');
      cachedBundleUrl = await bundle({
        entryPoint: path.join(__dirname, 'src', 'index.ts'),
        onProgress: (progress) => {
          if (progress % 25 === 0) send('log', `Compilando... ${progress}%`);
        },
      });
      send('log', 'Compilación lista.');
    } else {
      send('log', 'Usando compilación en caché.');
    }

    // ── Paso 2: Seleccionar la composición ──
    send('log', 'Cargando composición...');
    // Opciones de Chrome para entornos sin GPU (Docker/Railway)
    const chromiumOptions = {
      gl: 'swiftshader',   // renderer por software, sin necesidad de GPU
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-accelerated-2d-canvas',
      ],
    };

    const composition = await selectComposition({
      serveUrl: cachedBundleUrl,
      id: 'BelgaPropertyVideo',
      inputProps: { data },
      browserExecutable: CHROME_EXECUTABLE,
      chromiumOptions,
    });

    // ── Paso 3: Renderizar ──
    send('info', 'Renderizando video...');
    const outputFile = path.join(OUT_DIR, 'property-video.mp4');

    await renderMedia({
      composition,
      serveUrl: cachedBundleUrl,
      codec: 'h264',
      outputLocation: outputFile,
      inputProps: { data },
      browserExecutable: CHROME_EXECUTABLE,
      chromiumOptions,
      concurrency: 1,      // un frame a la vez para reducir uso de memoria
      onProgress: ({ progress }) => {
        const pct = Math.round(progress * 100);
        if (pct % 10 === 0) send('log', `Renderizando... ${pct}%`);
      },
    });

    send('done', 'Video generado con éxito');
  } catch (err) {
    console.error('Render error:', err);
    send('error', `Error: ${err.message || String(err)}`);
  } finally {
    res.end();
  }
});

/**
 * GET /api/download
 */
app.get('/api/download', (req, res) => {
  const outputFile = path.join(OUT_DIR, 'property-video.mp4');
  if (!fs.existsSync(outputFile)) {
    return res.status(404).json({ error: 'No hay ningún video renderizado todavía' });
  }
  res.download(outputFile, 'belga-propiedad.mp4');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Panel visual disponible en: http://localhost:${PORT}\n`);
});
