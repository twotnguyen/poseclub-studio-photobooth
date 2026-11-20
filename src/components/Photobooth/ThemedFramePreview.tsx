import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FrameTheme } from './types';
import { getThemeById, CUSTOM_FRAMES } from './FrameThemes';
import { getFrameCaptionBox, captionTextColor } from './frameCaption';

interface ThemedFramePreviewProps {
  theme: FrameTheme;
  onThemeChange: (theme: FrameTheme) => void;
  selectedStyle: number;
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
  const themes = CUSTOM_FRAMES.filter((t) => t.style === selectedStyle);
  const effectiveTheme = themes.find((t) => t.id === theme) ?? themes[0];
  const currentTheme = getThemeById(effectiveTheme?.id ?? theme);

  const stepTheme = (delta: number) => {
    const currentIndex = themes.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + delta + themes.length) % themes.length;
    onThemeChange(themes[nextIndex].id);
  };

  const captionBox = currentTheme.imageWidth && currentTheme.imageHeight
    ? getFrameCaptionBox(currentTheme.imageWidth, currentTheme.imageHeight, currentTheme.slots ?? [], customText)
    : null;
  const [captionFill, setCaptionFill] = useState<string>('#111111');
  const isLongCaption = captionBox
    ? customText.trim().length * captionBox.fontSize * 0.6 > captionBox.maxWidth
    : false;

  const handleFrameLoad = (image: HTMLImageElement) => {
    if (!captionBox) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    const [r, g, b] = ctx.getImageData(captionBox.centerX, captionBox.centerY, 1, 1).data;
    setCaptionFill(captionTextColor(r, g, b));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-6 md:gap-12 select-none">
      <button
        onClick={() => stepTheme(-1)}
        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title={previousThemeLabel}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>

      <div className="relative inline-block leading-none">
        <img
          src={currentTheme.imagePath}
          alt={currentTheme.nameEn}
          className="max-h-[52vh] w-auto max-w-full object-contain"
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
              {customText.trim().toUpperCase()}
            </text>
          </svg>
        )}
      </div>

      <button
        onClick={() => stepTheme(1)}
        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title={nextThemeLabel}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>
    </div>
  );
};
