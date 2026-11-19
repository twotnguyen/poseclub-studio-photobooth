import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { FrameTheme, FilterType } from './types';
import { getThemeById, CUSTOM_FRAMES } from './FrameThemes';
import { getFrameCaptionBox, captionTextColor } from './frameCaption';

interface ThemedFramePreviewProps {
  theme: FrameTheme;
  onThemeChange: (theme: FrameTheme) => void;
  selectedStyle: number;
  filter: FilterType;
  customText: string;
}

export const ThemedFramePreview: React.FC<ThemedFramePreviewProps> = ({
  theme,
  onThemeChange,
  selectedStyle,
  filter,
  customText,
}) => {
  const themes = CUSTOM_FRAMES.filter((t) => t.style === selectedStyle);
  const effectiveTheme = themes.find((t) => t.id === theme) ?? themes[0];
  const currentTheme = getThemeById(effectiveTheme?.id ?? theme);
  const barText = customText.trim() ? customText.trim().toUpperCase() : currentTheme.barText;

  const stepTheme = (delta: number) => {
    const currentIndex = themes.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + delta + themes.length) % themes.length;
    onThemeChange(themes[nextIndex].id);
  };

  // Background color for photo placeholder slots
  const getSlotBg = () => {
    switch (filter) {
      case 'bw-contrast':
        return '#1F1F1F';
      case 'bw-film':
        return '#262421';
      case 'natural':
        return '#F5EFEB';
      default:
        return currentTheme.slotBgDefault;
    }
  };

  const slotBg = getSlotBg();
  const isCustomImage = !!currentTheme.imagePath;
  const captionBox = isCustomImage && currentTheme.imageWidth && currentTheme.imageHeight
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
      
      {/* Left Carousel Arrow (<) */}
      <button
        onClick={() => stepTheme(-1)}
        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title="Previous Theme"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>

      {/* Main Themed Frame Display */}
      <div
        className={`relative transition-all duration-300 flex flex-col items-center justify-between ${
          isCustomImage ? '' : 'rounded-2xl md:rounded-3xl border-2 shadow-2xl p-2 sm:p-2.5 md:p-3'
        }`}
        style={isCustomImage ? undefined : {
          backgroundColor: currentTheme.bgColor,
          borderColor: currentTheme.borderColor,
          boxShadow: '0 20px 45px -10px rgba(0,0,0,0.25)',
        }}
      >
        {isCustomImage && (
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
        )}

        {/* ================= STYLE 1: POLAROID ================= */}
        {selectedStyle === 1 && !currentTheme.imagePath && (
          <div className="w-[160px] sm:w-[190px] md:w-[260px] lg:w-[290px] flex flex-col items-center">
            {currentTheme.isTextBar && (
              <p
                className="font-mono text-[9px] md:text-xs font-bold tracking-widest uppercase mb-1.5"
                style={{ color: currentTheme.textColor }}
              >
                {barText}
              </p>
            )}

            <div
              className="w-full aspect-square border relative flex flex-col items-center justify-center transition-all duration-300 rounded-xs"
              style={{
                backgroundColor: slotBg,
                borderColor: currentTheme.slotBorderColor,
              }}
            >
              <Camera className="w-8 h-8 md:w-16 md:h-16 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
              <span className="text-[8px] md:text-xs font-mono tracking-widest mt-1 opacity-50 uppercase" style={{ color: currentTheme.textColor }}>
                PHOTO REGION
              </span>
            </div>

            <div className="pt-2.5 sm:pt-3 pb-1 text-center w-full">
              <p
                className="font-editorial text-xs md:text-base font-bold tracking-widest uppercase truncate max-w-[220px] md:max-w-[340px] mx-auto"
                style={{ color: currentTheme.textColor }}
              >
                {customText.trim() ? customText.trim().toUpperCase() : 'POSECLUB STUDIO'}
              </p>
              <p className="text-[8px] md:text-[10px] font-mono tracking-wider opacity-60 mt-0.5" style={{ color: currentTheme.textColor }}>
                FULLERTON, CA
              </p>
            </div>
          </div>
        )}

        {/* ================= STYLE 2, 4: VERTICAL STRIP (Classic 1x4 or 1x2) ================= */}
        {!isCustomImage && (selectedStyle === 2 || selectedStyle === 4) && (
          <div
            className={`flex flex-col items-center relative ${
              selectedStyle === 4
                ? 'w-[98px] sm:w-[108px] md:w-[114px] lg:w-[116px]'
                : 'w-[110px] sm:w-[125px] md:w-[140px] lg:w-[150px]'
            }`}
          >
            {/* Photo Slots List */}
            <div className="w-full space-y-1 sm:space-y-1.5">
              {[...Array(selectedStyle === 2 ? 2 : 4)].map((_, idx) => (
                <div key={idx} className="space-y-0.5">
                  {/* Theme Text Bar (Images #7, #8, #9, #10) */}
                  {currentTheme.isTextBar && (
                    <p
                      className="font-mono text-[7px] md:text-[9px] font-bold tracking-wider text-center uppercase truncate"
                      style={{ color: currentTheme.textColor }}
                    >
                      {barText}
                    </p>
                  )}

                  {/* Slot Frame */}
                  <div
                    className="w-full aspect-[4/3] border relative flex flex-col items-center justify-center transition-all duration-300 rounded-xs"
                    style={{
                      backgroundColor: slotBg,
                      borderColor: currentTheme.slotBorderColor,
                    }}
                  >
                    <Camera className="w-4 h-4 md:w-6 md:h-6 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                    <span className="absolute bottom-1 right-1.5 text-[7px] md:text-[9px] font-mono opacity-50" style={{ color: currentTheme.textColor }}>
                      0{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Watermark */}
            <div className="pt-1.5 sm:pt-2 pb-0.5 text-center w-full">
              <p
                className="font-editorial text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-widest uppercase truncate max-w-[100px] md:max-w-[112px] mx-auto"
                style={{ color: currentTheme.textColor }}
              >
                {customText.trim() ? customText.trim().toUpperCase() : 'POSECLUB STUDIO'}
              </p>
            </div>
          </div>
        )}

        {/* ================= STYLE 3, 5, 6: GRID LAYOUTS (2x2, 2x3, 3x3) ================= */}
        {!isCustomImage && (selectedStyle === 3 || selectedStyle === 5 || selectedStyle === 6) && (
          <div
            className={`flex flex-col items-center relative ${
              selectedStyle === 3
                ? 'w-[160px] sm:w-[190px] md:w-[270px] lg:w-[300px]'
                : selectedStyle === 5
                ? 'w-[130px] sm:w-[155px] md:w-[200px] lg:w-[220px]'
                : 'w-[170px] sm:w-[200px] md:w-[290px] lg:w-[325px]'
            }`}
          >
            {currentTheme.isTextBar && (
              <p
                className="font-mono text-[8px] md:text-[10px] font-bold tracking-wider text-center uppercase mb-1"
                style={{ color: currentTheme.textColor }}
              >
                {barText}
              </p>
            )}

            <div
              className={`w-full grid gap-1 sm:gap-1.5 md:gap-2 ${
                selectedStyle === 3 ? 'grid-cols-2' : selectedStyle === 5 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {[...Array(selectedStyle === 3 ? 4 : selectedStyle === 5 ? 6 : 9)].map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-square border relative flex flex-col items-center justify-center transition-all duration-300 rounded-xs"
                  style={{
                    backgroundColor: slotBg,
                    borderColor: currentTheme.slotBorderColor,
                  }}
                >
                  <Camera className="w-4 h-4 md:w-7 md:h-7 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                  <span className="absolute bottom-0.5 right-1 text-[6px] md:text-[9px] font-mono opacity-50" style={{ color: currentTheme.textColor }}>
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 sm:pt-2.5 text-center w-full">
              <p
                className="font-editorial text-xs md:text-sm font-bold tracking-widest uppercase truncate max-w-[200px] md:max-w-[380px] mx-auto"
                style={{ color: currentTheme.textColor }}
              >
                {customText.trim() ? customText.trim().toUpperCase() : 'POSECLUB STUDIO'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Carousel Arrow (>) */}
      <button
        onClick={() => stepTheme(1)}
        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title="Next Theme"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>

    </div>
  );
};
