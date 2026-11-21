import React from 'react';
import { getThemesForStyle } from './FrameThemes';

interface FrameMockupProps {
  styleId: number;
}

export const FrameMockup: React.FC<FrameMockupProps> = ({ styleId }) => {
  const theme = getThemesForStyle(styleId)[0];
  if (!theme) return null;

  const fw = theme.imageWidth ?? 1240;
  const fh = theme.imageHeight ?? 1844;
  const isLandscape = fw > fh;

  return (
    <div className="relative w-full h-auto aspect-[150/116] flex items-center justify-center">
      <div
        className="relative shadow-md"
        style={{
          aspectRatio: `${fw} / ${fh}`,
          width: isLandscape ? '100%' : 'auto',
          height: isLandscape ? 'auto' : '100%',
          backgroundColor: '#0C0C0C',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {(theme.slots ?? []).map((box, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(box.x / fw) * 100}%`,
              top: `${(box.y / fh) * 100}%`,
              width: `${(box.w / fw) * 100}%`,
              height: `${(box.h / fh) * 100}%`,
              backgroundColor: '#FDEEC8',
              border: '1px solid rgba(0, 0, 0, 0.25)',
            }}
          />
        ))}
        {theme.imagePath && (
          <img src={theme.imagePath} alt="" className="absolute inset-0 w-full h-full pointer-events-none invert" />
        )}
      </div>
    </div>
  );
};
