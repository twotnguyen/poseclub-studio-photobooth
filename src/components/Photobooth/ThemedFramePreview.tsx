import React from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { FrameTheme, FilterType } from './types';
import { getThemeById, FRAME_THEMES } from './FrameThemes';

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
  const currentTheme = getThemeById(theme);
  const barText = customText.trim() ? customText.trim().toUpperCase() : currentTheme.barText;

  const handlePrev = () => {
    const currentIndex = FRAME_THEMES.findIndex((t) => t.id === theme);
    const prevIndex = (currentIndex - 1 + FRAME_THEMES.length) % FRAME_THEMES.length;
    onThemeChange(FRAME_THEMES[prevIndex].id);
  };

  const handleNext = () => {
    const currentIndex = FRAME_THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % FRAME_THEMES.length;
    onThemeChange(FRAME_THEMES[nextIndex].id);
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

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-6 md:gap-12 select-none">
      
      {/* Left Carousel Arrow (<) */}
      <button
        onClick={handlePrev}
        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title="Previous Theme"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>

      {/* Main Themed Frame Display */}
      <div
        className="relative rounded-2xl md:rounded-3xl border-2 shadow-2xl transition-all duration-300 p-2 sm:p-2.5 md:p-3 flex flex-col items-center justify-between"
        style={{
          backgroundColor: currentTheme.bgColor,
          borderColor: currentTheme.borderColor,
          boxShadow: '0 20px 45px -10px rgba(0,0,0,0.25)',
        }}
      >
        {/* ================= STYLE 1: POLAROID ================= */}
        {selectedStyle === 1 && (
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
              className={`w-full aspect-square border relative flex flex-col items-center justify-center transition-all duration-300 ${
                currentTheme.id === 'cutout' ? 'rounded-full' : 'rounded-xs'
              }`}
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
        {(selectedStyle === 2 || selectedStyle === 4) && (
          <div
            className={`flex flex-col items-center relative ${
              selectedStyle === 4
                ? 'w-[98px] sm:w-[108px] md:w-[114px] lg:w-[116px]'
                : 'w-[110px] sm:w-[125px] md:w-[140px] lg:w-[150px]'
            }`}
          >
            
            {/* Stars Decor (Image #1) */}
            {currentTheme.id === 'stars' && (
              <>
                <div className="absolute top-1 left-1.5 text-amber-300 text-[10px] md:text-xs pointer-events-none">✦ ✦</div>
                <div className="absolute top-1 right-1.5 text-amber-300 text-[9px] md:text-xs pointer-events-none">✦</div>
                <div className="absolute bottom-12 left-1 text-amber-300 text-[10px] md:text-xs pointer-events-none">✦</div>
                <div className="absolute bottom-11 right-1.5 text-amber-300 text-[11px] md:text-sm pointer-events-none">✦ ✦</div>
              </>
            )}

            {/* Doodle Hearts Decor (Image #2) */}
            {currentTheme.id === 'doodle' && (
              <>
                <div className="w-full text-center text-rose-500 text-[11px] md:text-sm tracking-widest -mt-1 mb-1 font-bold">
                  ♥♥♥
                </div>
                <div className="absolute top-1/3 -right-1 text-rose-500 text-[11px] md:text-sm pointer-events-none">✦</div>
                <div className="absolute bottom-11 left-1 text-rose-500 text-[11px] md:text-sm pointer-events-none">✦</div>
              </>
            )}

            {/* Hearts & Ribbons Decor (Image #6) */}
            {currentTheme.id === 'hearts' && (
              <>
                <div className="absolute top-1 left-1 text-rose-400 text-[9px] md:text-xs pointer-events-none">♥</div>
                <div className="absolute top-1 right-2 text-rose-400 text-[8px] md:text-xs pointer-events-none">♥</div>
                <div className="absolute top-1/2 -left-1 text-rose-400 text-[9px] md:text-xs pointer-events-none">🎀</div>
                <div className="absolute top-1/2 -right-1 text-rose-400 text-[9px] md:text-xs pointer-events-none">♥</div>
                <div className="absolute bottom-11 left-1.5 text-rose-400 text-[9px] md:text-xs pointer-events-none">♥</div>
              </>
            )}

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
                    className={`w-full aspect-[4/3] border relative flex flex-col items-center justify-center transition-all duration-300 ${
                      currentTheme.id === 'cutout'
                        ? 'rounded-xl md:rounded-2xl border-rose-500 border-2'
                        : currentTheme.id === 'doodle' && idx === 2
                        ? 'border-2 border-rose-500'
                        : 'rounded-xs'
                    }`}
                    style={{
                      backgroundColor: slotBg,
                      borderColor: currentTheme.slotBorderColor,
                    }}
                  >
                    {currentTheme.id === 'cutout' ? (
                      <span className="text-rose-400 text-base md:text-2xl">♥</span>
                    ) : (
                      <Camera className="w-4 h-4 md:w-6 md:h-6 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                    )}
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
        {(selectedStyle === 3 || selectedStyle === 5 || selectedStyle === 6) && (
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
                  className={`aspect-square border relative flex flex-col items-center justify-center transition-all duration-300 ${
                    currentTheme.id === 'cutout' ? 'rounded-xl md:rounded-2xl' : 'rounded-xs'
                  }`}
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
        onClick={handleNext}
        className="w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border border-black/30 bg-white/90 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title="Next Theme"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
      </button>

    </div>
  );
};
