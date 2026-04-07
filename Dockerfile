# Usa Node 18 sobre Debian slim
FROM node:18-slim

# ── Instalar Chrome y dependencias de sistema para Remotion ──
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto-color-emoji \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libxshmfence1 \
  xdg-utils \
  ca-certificates \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# ── Variables de entorno ──
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV REMOTION_CHROMIUM_EXECUTABLE=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=4000
# Aumentar memoria disponible para Node.js y el bundler
ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /app

# ── Instalar dependencias primero (capa cacheada) ──
COPY package*.json ./
RUN npm ci --omit=dev

# ── Copiar código fuente ──
COPY . .

# ── Crear carpeta de salida ──
RUN mkdir -p out

EXPOSE 4000

CMD ["node", "server.js"]
