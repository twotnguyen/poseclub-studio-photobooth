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
  const themeIndex = FRAME_THEMES.findIndex((t) => t.id === theme);

  const handlePrev = () => {
    const nextIdx = (themeIndex - 1 + FRAME_THEMES.length) % FRAME_THEMES.length;
    onThemeChange(FRAME_THEMES[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (themeIndex + 1) % FRAME_THEMES.length;
    onThemeChange(FRAME_THEMES[nextIdx].id);
  };

  // Determine slot background based on active filter
  const getSlotBg = () => {
    if (filter === 'bw-contrast') {
      return currentTheme.id === 'classic-white' ? '#E2E2E6' : '#1F1F21';
    }
    if (filter === 'bw-film') {
      return currentTheme.id === 'classic-white' ? '#EAE2D2' : '#2A2624';
    }
    // Clean natural
    if (currentTheme.id === 'cutout' || currentTheme.id === 'valentine' || currentTheme.id === 'be-valentine') {
      return '#3D3438';
    }
    return currentTheme.id === 'classic-white' ? '#FDEEC8' : '#26241E';
  };

  const slotBg = getSlotBg();

  return (
    <div className="relative w-full max-w-xl mx-auto flex items-center justify-center gap-4 sm:gap-8 select-none">
      
      {/* Left Carousel Arrow (<) */}
      <button
        onClick={handlePrev}
        className="w-12 h-12 rounded-full border border-black/30 bg-white/80 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title="Previous Theme"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Main Themed Frame Display */}
      <div
        className="relative rounded-2xl border-2 shadow-2xl transition-all duration-300 p-2 sm:p-2.5 flex flex-col items-center justify-between"
        style={{
          backgroundColor: currentTheme.bgColor,
          borderColor: currentTheme.borderColor,
          boxShadow: '0 20px 45px -10px rgba(0,0,0,0.25)',
        }}
      >
        {/* ================= STYLE 1: POLAROID ================= */}
        {selectedStyle === 1 && (
          <div className="w-[210px] sm:w-[230px] flex flex-col items-center">
            {currentTheme.isTextBar && (
              <p
                className="font-mono text-[10px] font-bold tracking-widest uppercase mb-1.5"
                style={{ color: currentTheme.textColor }}
              >
                {currentTheme.barText}
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
              <Camera className="w-10 h-10 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
              <span className="text-[9px] font-mono tracking-widest mt-1 opacity-50 uppercase" style={{ color: currentTheme.textColor }}>
                PHOTO REGION
              </span>
            </div>

            <div className="pt-3 pb-1 text-center w-full">
              <p
                className="font-editorial text-xs sm:text-sm font-bold tracking-widest uppercase truncate max-w-[220px] mx-auto"
                style={{ color: currentTheme.textColor }}
              >
                {customText.trim() ? customText.trim().toUpperCase() : 'POSECLUB STUDIO'}
              </p>
              <p className="text-[8px] font-mono tracking-wider opacity-60 mt-0.5" style={{ color: currentTheme.textColor }}>
                FULLERTON, CA
              </p>
            </div>
          </div>
        )}

        {/* ================= STYLE 2, 4: VERTICAL STRIP (Classic 1x4 or 1x2) ================= */}
        {(selectedStyle === 2 || selectedStyle === 4) && (
          <div className="w-[126px] sm:w-[138px] flex flex-col items-center relative">
            
            {/* Stars Decor (Image #1) */}
            {currentTheme.id === 'stars' && (
              <>
                <div className="absolute top-1 left-1.5 text-amber-300 text-[10px] pointer-events-none">✦ ✦</div>
                <div className="absolute top-1 right-1.5 text-amber-300 text-[9px] pointer-events-none">✦</div>
                <div className="absolute bottom-12 left-1 text-amber-300 text-[10px] pointer-events-none">✦</div>
                <div className="absolute bottom-11 right-1.5 text-amber-300 text-[11px] pointer-events-none">✦ ✦</div>
              </>
            )}

            {/* Doodle Hearts Decor (Image #2) */}
            {currentTheme.id === 'doodle' && (
              <>
                <div className="w-full text-center text-rose-500 text-[11px] tracking-widest -mt-1 mb-1 font-bold">
                  ♥♥♥
                </div>
                <div className="absolute top-1/3 -right-1 text-rose-500 text-[11px] pointer-events-none">✦</div>
                <div className="absolute bottom-11 left-1 text-rose-500 text-[11px] pointer-events-none">✦</div>
              </>
            )}

            {/* Hearts & Ribbons Decor (Image #6) */}
            {currentTheme.id === 'hearts' && (
              <>
                <div className="absolute top-1 left-1 text-rose-400 text-[9px] pointer-events-none">♥</div>
                <div className="absolute top-1 right-2 text-rose-400 text-[8px] pointer-events-none">♥</div>
                <div className="absolute top-1/2 -left-1 text-rose-400 text-[9px] pointer-events-none">🎀</div>
                <div className="absolute top-1/2 -right-1 text-rose-400 text-[9px] pointer-events-none">♥</div>
                <div className="absolute bottom-11 left-1.5 text-rose-400 text-[9px] pointer-events-none">♥</div>
              </>
            )}

            {/* Photo Slots List */}
            <div className="w-full space-y-1.5">
              {[...Array(selectedStyle === 2 ? 2 : 4)].map((_, idx) => (
                <div key={idx} className="space-y-0.5">
                  {/* Theme Text Bar (Images #7, #8, #9, #10) */}
                  {currentTheme.isTextBar && (
                    <p
                      className="font-mono text-[7px] font-bold tracking-wider text-center uppercase truncate"
                      style={{ color: currentTheme.textColor }}
                    >
                      {currentTheme.barText}
                    </p>
                  )}

                  {/* Slot Frame */}
                  <div
                    className={`w-full aspect-[4/3] border relative flex flex-col items-center justify-center transition-all duration-300 ${
                      currentTheme.id === 'cutout'
                        ? 'rounded-2xl border-rose-500 border-2'
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
                      <span className="text-rose-400 text-lg">♥</span>
                    ) : (
                      <Camera className="w-5 h-5 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                    )}
                    <span className="absolute bottom-1 right-1.5 text-[7px] font-mono opacity-50" style={{ color: currentTheme.textColor }}>
                      0{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Watermark */}
            <div className="pt-2.5 pb-0.5 text-center w-full">
              <p
                className="font-editorial text-[10px] font-bold tracking-widest uppercase truncate max-w-[130px] mx-auto"
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
              selectedStyle === 3 ? 'w-[190px] sm:w-[210px]' : selectedStyle === 5 ? 'w-[170px] sm:w-[185px]' : 'w-[210px] sm:w-[230px]'
            }`}
          >
            {currentTheme.isTextBar && (
              <p
                className="font-mono text-[8px] font-bold tracking-wider text-center uppercase mb-1"
                style={{ color: currentTheme.textColor }}
              >
                {currentTheme.barText}
              </p>
            )}

            <div
              className={`w-full grid gap-1.5 ${
                selectedStyle === 3 ? 'grid-cols-2' : selectedStyle === 5 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {[...Array(selectedStyle === 3 ? 4 : selectedStyle === 5 ? 6 : 9)].map((_, idx) => (
                <div
                  key={idx}
                  className={`aspect-square border relative flex flex-col items-center justify-center transition-all duration-300 ${
                    currentTheme.id === 'cutout' ? 'rounded-xl' : 'rounded-xs'
                  }`}
                  style={{
                    backgroundColor: slotBg,
                    borderColor: currentTheme.slotBorderColor,
                  }}
                >
                  <Camera className="w-4 h-4 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                  <span className="absolute bottom-0.5 right-1 text-[6px] font-mono opacity-50" style={{ color: currentTheme.textColor }}>
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center w-full">
              <p
                className="font-editorial text-xs font-bold tracking-widest uppercase truncate max-w-[200px] mx-auto"
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
        className="w-12 h-12 rounded-full border border-black/30 bg-white/80 hover:bg-black hover:text-white transition-all flex items-center justify-center text-black shadow-md cursor-pointer hover:scale-105 active:scale-95 z-20"
        title="Next Theme"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

    </div>
  );
};
