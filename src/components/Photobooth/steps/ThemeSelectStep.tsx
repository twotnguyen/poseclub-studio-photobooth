import React from 'react';
import { ThemedFramePreview } from '../ThemedFramePreview';
import { useBooth } from '../BoothContext';

export const ThemeSelectStep: React.FC = () => {
  const {
    t, selectedStyle, theme, setTheme, customText, setCustomText,
    startNewStrip, goTo,
  } = useBooth();

  return (
    <div className="h-full flex flex-col pb-1">
      <div className="text-center space-y-0.5 sm:space-y-1 py-1 [@media(max-height:500px)]:py-0">
        <h2 className="font-editorial text-xl sm:text-4xl [@media(max-height:500px)]:text-base text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
          {t.step2Title}
        </h2>
        <p className="text-[11px] sm:text-xs [@media(max-height:500px)]:hidden text-black/50 font-mono tracking-wider">
          {t.step2Subtitle}
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 sm:gap-5 [@media(max-height:500px)]:gap-1 [@media(max-height:500px)]:[&_img]:max-h-[30vh]">
        <ThemedFramePreview
          theme={theme}
          onThemeChange={setTheme}
          selectedStyle={selectedStyle}
          customText={customText}
          previousThemeLabel={t.previousTheme}
          nextThemeLabel={t.nextTheme}
        />

        <div className="max-w-sm w-full mx-auto bg-white/95 backdrop-blur-sm border border-black/15 rounded-2xl p-2.5 sm:p-3 [@media(max-height:500px)]:p-1 shadow-sm">
          <div className="space-y-1">
            <label htmlFor="custom-strip-text" className="text-[10px] font-mono uppercase tracking-widest text-black/60 font-semibold">
              {t.customTextLabel}
            </label>
            <input
              id="custom-strip-text"
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t.customTextPlaceholder}
              maxLength={26}
              className="w-full px-3 py-1.5 [@media(max-height:500px)]:py-0.5 [@media(max-height:500px)]:min-h-11 rounded-xl border border-black/20 bg-stone-50 text-xs font-mono focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto grid grid-cols-3 items-center pt-1 pb-1 [@media(max-height:500px)]:pt-0">
        <button
          onClick={() => goTo('frame')}
          className="justify-self-center w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-black/50 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-sm cursor-pointer group"
          title={t.back}
        >
          <span className="text-[8px] font-serif uppercase tracking-widest leading-none">{t.back.toUpperCase()}</span>
          <span className="text-xs leading-none mt-0.5 group-hover:-translate-x-0.5 transition-transform">←</span>
        </button>

        <div className="hidden sm:flex flex-col items-center justify-self-center">
          <span className="text-[8px] font-mono tracking-[0.3em] text-black/50 uppercase">POSECLUB</span>
          <span className="font-script text-xl sm:text-2xl text-black -mt-1">studio</span>
          <div className="w-14 h-[1px] bg-black/20 mt-0.5" />
        </div>

        <button
          onClick={() => { startNewStrip(); goTo('capture'); }}
          className="justify-self-center px-6 sm:px-8 py-2.5 min-h-11 [@media(max-height:500px)]:py-1.5 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-[11px] sm:text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>{t.startCapture}</span>
          <span>✦</span>
        </button>
      </div>
    </div>
  );
};
