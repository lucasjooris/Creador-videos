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

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [30, 0])}px)`,
        flex: 1,
      }}
    >
      <div style={{ fontSize: 52, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          fontFamily: FONTS.price,
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.white,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 24,
          color: COLORS.goldLight,
          marginTop: 6,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/**
 * Escena 2 (90–210 frames): foto de fondo difuminada + tarjetas de estadísticas
 * Duración recomendada: 4 segundos @ 30fps
 */
export const SceneDetails: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelSlide = spring({ frame, fps, config: { damping: 22 } });
  const panelY = interpolate(panelSlide, [0, 1], [120, 0]);

  const formatPrice = (usd: number) =>
    'USD ' +
    usd.toLocaleString('es-AR', { minimumFractionDigits: 0 });

  return (
    <AbsoluteFill>
      {/* Foto de fondo desenfocada */}
      <Img
        src={data.imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(8px) brightness(0.4)',
          transform: 'scale(1.08)',
        }}
      />

      {/* Panel principal */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: SPACING.md,
          transform: `translateY(${panelY}px)`,
          opacity: panelSlide,
        }}
      >
        {/* Precio destacado */}
        <div
          style={{
            backgroundColor: COLORS.gold,
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            marginBottom: SPACING.md,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              color: COLORS.navy,
              letterSpacing: 2,
              textTransform: 'uppercase' as const,
              fontWeight: 600,
            }}
          >
            Precio
          </div>
          <div
            style={{
              fontFamily: FONTS.price,
              fontSize: 80,
              fontWeight: 700,
              color: COLORS.navy,
              lineHeight: 1,
            }}
          >
            {formatPrice(data.priceUSD)}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            backgroundColor: COLORS.navyLight,
            padding: `${SPACING.md}px ${SPACING.sm}px`,
            display: 'flex',
            flexDirection: 'row',
            gap: SPACING.sm,
          }}
        >
          <StatCard
            icon="📐"
            value={`${data.surfaceM2}`}
            label="m²"
            delay={4}
          />
          <div
            style={{
              width: 1,
              backgroundColor: COLORS.gold,
              opacity: 0.4,
              alignSelf: 'stretch',
            }}
          />
          <StatCard
            icon="🚪"
            value={`${data.rooms}`}
            label="ambientes"
            delay={8}
          />
          <div
            style={{
              width: 1,
              backgroundColor: COLORS.gold,
              opacity: 0.4,
              alignSelf: 'stretch',
            }}
          />
          <StatCard
            icon="📍"
            value={data.neighborhood}
            label="zona"
            delay={12}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
