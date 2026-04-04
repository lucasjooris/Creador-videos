import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { PropertyData } from './types';
import { SceneIntro } from './components/SceneIntro';
import { SceneDetails } from './components/SceneDetails';
import { SceneCTA } from './components/SceneCTA';

interface Props {
  data: PropertyData;
}

/**
 * Video principal 9:16 (1080×1920) para Instagram Reels / Stories.
 *
 * Estructura de escenas (total: 300 frames @ 30fps = 10 segundos):
 *   - SceneIntro:   90 frames (3s)  — foto + barrio + badge de operación
 *   - SceneDetails: 120 frames (4s) — precio + m² + ambientes
 *   - SceneCTA:     90 frames (3s)  — logo Belga + llamada a la acción
 */
export const PropertyVideo: React.FC<Props> = ({ data }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1A2B4A' }}>
      <Series>
        <Series.Sequence durationInFrames={90}>
          <SceneIntro data={data} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={120}>
          <SceneDetails data={data} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={90}>
          <SceneCTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
