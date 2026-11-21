import React from 'react';
import { FrameMockup } from '../FrameMockup';
import { useBooth } from '../BoothContext';

export const FrameSelectStep: React.FC = () => {
  const { t, selectedStyle, selectStyle, backToHome, goTo } = useBooth();

  return (
    <div className="h-full flex flex-col justify-between pb-1">
      <div className="text-center space-y-0.5 sm:space-y-1 py-0.5 sm:py-1 [@media(max-height:500px)]:py-0">
        <h2 className="font-editorial text-xl sm:text-4xl [@media(max-height:500px)]:text-base text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
          {t.step1Title}
        </h2>
        <p className="text-[11px] sm:text-xs [@media(max-height:500px)]:hidden text-black/50 font-mono tracking-wider">
          {t.step1Subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 [@media(max-height:500px)]:grid-cols-3 gap-1 sm:gap-5 [@media(max-height:500px)]:gap-1 max-w-4xl w-full mx-auto my-auto py-1 [@media(max-height:500px)]:py-0">
        {t.styles.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => { if (!isSelected) selectStyle(style.id); }}
              className={`relative p-1.5 sm:p-3.5 [@media(max-height:500px)]:p-1 rounded-[18px] sm:rounded-[26px] bg-white transition-all flex flex-col items-center justify-between text-center group cursor-pointer ${
                isSelected
                  ? 'border border-black shadow-xl scale-105 ring-2 ring-black/20 bg-black/[0.015]'
                  : 'border border-black hover:shadow-md hover:ring-1 hover:ring-black/30'
              }`}
            >
              <p className="font-serif text-xs [@media(max-height:500px)]:text-[10px] tracking-[0.2em] uppercase font-medium text-black pt-0.5">
                {style.title}
              </p>

              <div className="my-1 flex w-full items-center justify-center max-[375px]:max-w-[120px] [@media(max-height:500px)]:my-0 [@media(max-height:500px)]:max-w-[76px]">
                <FrameMockup styleId={style.id} />
              </div>

              <p className="text-[9px] sm:text-[10px] font-mono text-black/50 uppercase leading-tight pb-0.5">
                {style.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-1 [@media(max-height:500px)]:pt-0 pb-1">
        <button
          onClick={backToHome}
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-black/60 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-sm cursor-pointer group"
          title={t.back}
        >
          <span className="text-[8px] sm:text-[9px] font-serif uppercase tracking-widest leading-none">{t.back.toUpperCase()}</span>
          <span className="text-[10px] sm:text-xs leading-none mt-0.5 sm:mt-1 group-hover:-translate-x-0.5 transition-transform">←</span>
        </button>

        <div className="hidden sm:flex flex-col items-center">
          <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.3em] text-black/50 uppercase">POSECLUB</span>
          <span className="font-script text-xl sm:text-2xl text-black -mt-1">studio</span>
          <div className="w-12 sm:w-16 h-[1px] bg-black/20 mt-0.5" />
        </div>

        <button
          onClick={() => goTo('theme')}
          disabled={selectedStyle === null}
          className="px-5 sm:px-8 py-2 sm:py-3 min-h-11 [@media(max-height:500px)]:py-1 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-[11px] sm:text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span>{t.next}</span>
          <span>✦</span>
        </button>
      </div>
    </div>
  );
};
