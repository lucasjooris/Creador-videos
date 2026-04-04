export interface PropertyData {
  /** URL de la foto principal. Puede ser una URL https:// o un path relativo a /public */
  imageUrl: string;
  /** Precio en USD, ej: 285000 */
  priceUSD: number;
  /** Superficie total en m², ej: 120 */
  surfaceM2: number;
  /** Cantidad de ambientes, ej: 3 */
  rooms: number;
  /** Barrio o zona, ej: "Palermo Soho" */
  neighborhood: string;
  /** Tipo de operación, ej: "Venta" | "Alquiler" */
  operation: 'Venta' | 'Alquiler';
  /** Descripción corta opcional */
  tagline?: string;
}
