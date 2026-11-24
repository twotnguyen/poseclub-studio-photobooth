import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FrameTheme } from './types';
import { getThemesForStyle, getThemeById } from './FrameThemes';
import { getFrameCaptionBox, captionTextColor, formatCaptionText } from './frameCaption';

interface ThemedFramePreviewProps {
  theme: FrameTheme;
  onThemeChange: (theme: FrameTheme) => void;
  selectedStyle: number | null;
  customText: string;
  previousThemeLabel: string;
  nextThemeLabel: string;
}

export const ThemedFramePreview: React.FC<ThemedFramePreviewProps> = ({
  theme,
  onThemeChange,
  selectedStyle,
  customText,
  previousThemeLabel,
  nextThemeLabel,
}) => {
  const themes = getThemesForStyle(selectedStyle ?? 1);
  const effectiveTheme = themes.find((t) => t.id === theme) ?? themes[0];
  const currentTheme = getThemeById(effectiveTheme?.id ?? theme);

  const captionBox = currentTheme.imageWidth && currentTheme.imageHeight
    ? getFrameCaptionBox(currentTheme.imageWidth, currentTheme.imageHeight, currentTheme.slots ?? [], formatCaptionText(customText))
    : null;
  const [captionFill, setCaptionFill] = useState<string>('#111111');
  const frameImageRef = useRef<HTMLImageElement | null>(null);
  const captionX = captionBox?.centerX;
  const captionY = captionBox?.centerY;
  const sampleCaption = useCallback((image: HTMLImageElement) => {
    if (captionX === undefined || captionY === undefined) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, captionX, captionY, 1, 1, 0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    setCaptionFill(captionTextColor(r, g, b, a));
  }, [captionX, captionY]);

  useEffect(() => {
    if (frameImageRef.current) sampleCaption(frameImageRef.current);
  }, [sampleCaption, customText]);

  if (themes.length === 0) return null;

  const currentIndex = Math.max(0, themes.findIndex((t) => t.id === effectiveTheme?.id));
  const stepTheme = (delta: number) => {
    onThemeChange(themes[(currentIndex + delta + themes.length) % themes.length].id);
  };

  const isLongCaption = captionBox
    ? formatCaptionText(customText).length * captionBox.fontSize * 0.6 > captionBox.maxWidth
    : false;

  const handleFrameLoad = (image: HTMLImageElement) => {
    frameImageRef.current = image;
    sampleCaption(image);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex-1 min-h-0 flex items-center justify-center gap-2 sm:gap-4 md:gap-6 select-none">
      <button
        onClick={() => stepTheme(-1)}
        className="w-11 h-11 sm:w-11 md:w-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title={previousThemeLabel}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>

      <div className="relative flex h-full min-h-0 items-center justify-center leading-none">
        <img
          src={currentTheme.imagePath}
          alt={currentTheme.nameEn}
          className="max-h-full w-auto max-w-full object-contain"
          onLoad={(event) => handleFrameLoad(event.currentTarget)}
        />
        {captionBox && (
          <svg
            viewBox={`0 0 ${currentTheme.imageWidth} ${currentTheme.imageHeight}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <text
              x={captionBox.centerX}
              y={captionBox.centerY}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Playfair Display, Georgia, serif"
              fontWeight={600}
              fontSize={captionBox.fontSize}
              fill={captionFill}
              textLength={isLongCaption ? captionBox.maxWidth : undefined}
              lengthAdjust={isLongCaption ? 'spacingAndGlyphs' : undefined}
            >
              {formatCaptionText(customText)}
            </text>
          </svg>
        )}
      </div>

      <button
        onClick={() => stepTheme(1)}
        className="w-11 h-11 sm:w-11 md:w-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title={nextThemeLabel}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>
    </div>
  );
};
