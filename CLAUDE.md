# Creador de Videos — Belga Inmobiliaria

Template de video en Remotion para publicar propiedades en Instagram Reels/Stories (9:16).

## Comandos esenciales

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Abrir Remotion Studio (preview interactivo en el browser)
npm start

# Renderizar el video a out/property-video.mp4
npm run render

# Renderizar con datos de propiedad personalizados
npx remotion render BelgaPropertyVideo out/mi-propiedad.mp4 \
  --props='{"data":{"imageUrl":"https://...","priceUSD":250000,"surfaceM2":95,"rooms":2,"neighborhood":"Recoleta","operation":"Venta"}}'
```

## Estructura del proyecto

```
src/
  index.ts              # Punto de entrada Remotion
  Root.tsx              # Registro de composiciones + datos de ejemplo
  PropertyVideo.tsx     # Componente principal (orquesta las 3 escenas)
  theme.ts              # Paleta de colores, tipografías y espaciados
  types.ts              # Interfaz PropertyData
  components/
    SceneIntro.tsx      # Escena 1: foto + barrio + badge operación (3s)
    SceneDetails.tsx    # Escena 2: precio + m² + ambientes (4s)
    SceneCTA.tsx        # Escena 3: logo Belga + CTA (3s)
public/
  logo-belga.png        # Logo oficial (agregarlo manualmente)
remotion.config.ts      # Configuración de Remotion
```

## Cómo personalizar una propiedad

Editá `src/Root.tsx` y modificá el objeto `SAMPLE_PROPERTY`:

```ts
const SAMPLE_PROPERTY: PropertyData = {
  imageUrl: 'https://tu-foto.com/imagen.jpg', // o '/foto-local.jpg' en public/
  priceUSD: 285000,
  surfaceM2: 120,
  rooms: 3,
  neighborhood: 'Palermo Soho',
  operation: 'Venta',          // 'Venta' | 'Alquiler'
  tagline: 'Texto descriptivo opcional',
};
```

## Agregar el logo real de Belga

1. Descargá el logo desde belga.com.ar (botón derecho → Guardar imagen)
2. Copialo a `public/logo-belga.png`
3. En `src/components/SceneCTA.tsx`, reemplazá el bloque del wordmark simulado:

```tsx
// Borrar el bloque con fontFamily: FONTS.heading y texto "BELGA"
// Agregar en su lugar:
import { Img } from 'remotion';
// ...
<Img src="/logo-belga.png" style={{ width: 320, opacity: appear }} />
```

## Ajustar colores exactos de Belga

1. Abrí belga.com.ar en Chrome → F12 → pestaña Elements
2. Hacé click en el header o botones principales
3. En "Styles" copiá los valores HEX de `color:` y `background-color:`
4. Editá `src/theme.ts` → reemplazá los valores en `COLORS`

## Formato de salida

| Propiedad | Valor |
|-----------|-------|
| Resolución | 1080 × 1920 px (9:16) |
| FPS | 30 |
| Duración | 10 segundos (300 frames) |
| Formato render | MP4 (H.264) |

## Escenas y timing

| Escena | Frames | Duración |
|--------|--------|----------|
| SceneIntro — foto + barrio | 0–89 | 3s |
| SceneDetails — precio + stats | 90–209 | 4s |
| SceneCTA — logo + contacto | 210–299 | 3s |

Para cambiar la duración de una escena, modificá `durationInFrames` en `src/PropertyVideo.tsx`
y ajustá el total en `src/Root.tsx` (`durationInFrames={300}`).

## Flujo de trabajo para nuevas propiedades

1. Obtené la URL de la foto principal (o copiá la imagen a `public/`)
2. Actualizá `SAMPLE_PROPERTY` en `src/Root.tsx`
3. Revisá la preview con `npm start`
4. Renderizá con `npm run render`
5. El video queda en `out/property-video.mp4`

## Dependencias clave

- `remotion` — motor principal de renderizado React→Video
- `@remotion/cli` — CLI para studio y render
- Node.js 18+ requerido

## Notas de arquitectura

- Cada escena es un componente independiente que recibe `data: PropertyData`
- Las animaciones usan `spring()` y `interpolate()` de Remotion para fluidez
- Los colores, fuentes y espaciados están centralizados en `src/theme.ts`
- El formato 1080×1920 es nativo para Instagram Reels y Stories
