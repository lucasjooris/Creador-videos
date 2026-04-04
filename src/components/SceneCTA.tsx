import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS, SPACING } from '../theme';

/**
 * Escena 3 (210–300 frames): pantalla final con logo y llamada a la acción
 * Duración recomendada: 3 segundos @ 30fps
 */
export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame, fps, config: { damping: 20 } });
  const logoScale = interpolate(appear, [0, 1], [0.6, 1]);
  const textY = interpolate(appear, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.lg,
      }}
    >
      {/* Línea decorativa superior */}
      <div
        style={{
          width: interpolate(appear, [0, 1], [0, 160]),
          height: 3,
          backgroundColor: COLORS.gold,
        }}
      />

      {/* Logo placeholder — reemplazá con <Img src="/logo-belga.png" /> */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: appear,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Wordmark simulado — reemplazá con imagen del logo real */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 92,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: 10,
            lineHeight: 1,
          }}
        >
          BELGA
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.gold,
            letterSpacing: 8,
            textTransform: 'uppercase' as const,
            marginTop: 8,
          }}
        >
          Inmobiliaria
        </div>
      </div>

      {/* Línea decorativa inferior */}
      <div
        style={{
          width: interpolate(appear, [0, 1], [0, 160]),
          height: 3,
          backgroundColor: COLORS.gold,
        }}
      />

      {/* CTA */}
      <div
        style={{
          transform: `translateY(${textY}px)`,
          opacity: appear,
          textAlign: 'center',
          marginTop: SPACING.sm,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 32,
            color: COLORS.offWhite,
            letterSpacing: 2,
          }}
        >
          www.belga.com.ar
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 26,
            color: COLORS.goldLight,
            marginTop: SPACING.xs,
          }}
        >
          📞 Consultanos hoy
        </div>
      </div>
    </AbsoluteFill>
  );
};
