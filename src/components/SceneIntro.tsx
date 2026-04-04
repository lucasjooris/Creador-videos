import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS, SPACING } from '../theme';
import { PropertyData } from '../types';

interface Props {
  data: PropertyData;
}

/**
 * Escena 1 (0–90 frames): foto de fondo con overlay + barrio + tipo de operación
 * Duración recomendada: 3 segundos @ 30fps
 */
export const SceneIntro: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: { damping: 20 } });

  const neighborhoodY = interpolate(fadeIn, [0, 1], [40, 0]);
  const operationScale = interpolate(fadeIn, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill>
      {/* Foto de fondo */}
      <Img
        src={data.imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Overlay degradado */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 30%,
            ${COLORS.overlayStrong} 100%
          )`,
        }}
      />

      {/* Badge de operación (arriba derecha) */}
      <div
        style={{
          position: 'absolute',
          top: SPACING.lg,
          right: SPACING.md,
          backgroundColor: COLORS.gold,
          color: COLORS.navy,
          fontFamily: FONTS.body,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase' as const,
          padding: `${SPACING.xs}px ${SPACING.sm}px`,
          transform: `scale(${operationScale})`,
          opacity: fadeIn,
        }}
      >
        {data.operation}
      </div>

      {/* Barrio (centro inferior) */}
      <div
        style={{
          position: 'absolute',
          bottom: SPACING.xl,
          left: SPACING.md,
          right: SPACING.md,
          transform: `translateY(${neighborhoodY}px)`,
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 72,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.1,
            textShadow: '0 2px 16px rgba(0,0,0,0.5)',
          }}
        >
          {data.neighborhood}
        </div>
        {data.tagline && (
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 30,
              color: COLORS.goldLight,
              marginTop: SPACING.xs,
              letterSpacing: 1,
            }}
          >
            {data.tagline}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
