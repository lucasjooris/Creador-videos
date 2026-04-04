import React from 'react';
import { Composition } from 'remotion';
import { PropertyVideo } from './PropertyVideo';
import { PropertyData } from './types';

/**
 * Datos de ejemplo — reemplazá con los de tu propiedad real
 * o pasalos como inputProps al momento de renderizar.
 */
const SAMPLE_PROPERTY: PropertyData = {
  imageUrl:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1080&q=80',
  priceUSD: 285000,
  surfaceM2: 120,
  rooms: 3,
  neighborhood: 'Palermo Soho',
  operation: 'Venta',
  tagline: 'Departamento con luminosidad excepcional',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BelgaPropertyVideo"
        component={PropertyVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: SAMPLE_PROPERTY }}
      />
    </>
  );
};
