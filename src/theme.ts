/**
 * Paleta visual inspirada en Belga Inmobiliaria.
 * Ajustá los valores con exactitud usando DevTools en belga.com.ar.
 *
 * Para extraer colores exactos:
 *   1. Abrí belga.com.ar en Chrome
 *   2. F12 → Elements → click en cualquier elemento
 *   3. En la pestaña Styles, buscá "color:" o "background-color:"
 *   4. Reemplazá los valores abajo con los HEX que encuentres
 */

export const COLORS = {
  // Primario: azul marino oscuro (típico inmobiliaria premium argentina)
  navy: '#1A2B4A',
  navyLight: '#243860',

  // Acento dorado / arena
  gold: '#C9A96E',
  goldLight: '#DFC28F',

  // Neutros
  white: '#FFFFFF',
  offWhite: '#F5F0EA',
  lightGray: '#E8E2D9',
  darkGray: '#555555',
  black: '#0D0D0D',

  // Overlay semitransparente para la foto
  overlay: 'rgba(26, 43, 74, 0.72)',
  overlayStrong: 'rgba(26, 43, 74, 0.88)',
};

export const FONTS = {
  // Cambiá a la fuente exacta de Belga si la identificás en DevTools
  heading: 'Georgia, "Times New Roman", serif',
  body: '"Helvetica Neue", Arial, sans-serif',
  price: 'Georgia, "Times New Roman", serif',
};

export const SPACING = {
  xs: 12,
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
};
