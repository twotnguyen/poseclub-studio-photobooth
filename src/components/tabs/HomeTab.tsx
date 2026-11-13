import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../i18n/translations';

interface HomeTabProps {
  language: Language;
  onStart: () => void;
  onGoToStudio: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ language, onStart, onGoToStudio }) => {
  const t = TRANSLATIONS[language].home;

  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      
      {/* Top Left Sparkles */}
      <div className="absolute top-8 left-10 flex flex-col items-center gap-1 text-black opacity-85">
        <Sparkles className="w-8 h-8 stroke-[1.5]" />
        <span className="text-[10px] font-mono tracking-widest opacity-60">EST. 2024</span>
      </div>

      {/* Top Right Camera Doodle */}
      <div className="absolute top-8 right-12 text-black opacity-80 hover:rotate-6 transition-transform">
        <div className="w-12 h-9 border-2 border-black rounded-lg flex items-center justify-center relative shadow-sm">
          <div className="w-5 h-5 rounded-full border-2 border-black" />
          <div className="absolute -top-1.5 left-2 w-3 h-1 bg-black rounded-sm" />
          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-black rounded-full" />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Main Center Content (Exact Canva Slide 1 Layout) */}
      <div className="text-center space-y-4 max-w-3xl mx-auto my-auto">
        <p className="text-xs sm:text-sm font-mono tracking-[0.35em] text-black/70 uppercase">
          {t.studio}
        </p>

        {/* Large Signature Script */}
        <h1 className="font-script text-7xl sm:text-9xl text-black leading-none drop-shadow-sm py-2">
          Poseclub
        </h1>

        <p className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-black/75 uppercase pt-1">
          {t.slogan}
        </p>

        {/* Action Button: ✦ START */}
        <div className="pt-8">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-10 py-3.5 rounded-full border-2 border-black bg-white/70 hover:bg-black hover:text-white text-black transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <span className="text-xs font-mono uppercase tracking-[0.25em] font-semibold flex items-center gap-2">
              <span>{t.startBtn}</span>
            </span>
          </button>
        </div>

        {/* Studio Location Quick Badge */}
        <div className="pt-4">
          <button
            onClick={onGoToStudio}
            className="text-[11px] font-mono text-black/60 hover:text-black tracking-wider uppercase underline underline-offset-4 decoration-black/30 hover:decoration-black transition-colors"
          >
            {t.location}
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Center Brand Signature & Ornament */}
      <div className="w-full flex flex-col items-center justify-center gap-1.5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-[1px] bg-black/20" />
          <span className="font-script text-2xl text-black/80">poseclub</span>
          <span className="font-editorial text-xs tracking-widest text-black/60 uppercase">studio</span>
          <div className="w-12 h-[1px] bg-black/20" />
        </div>
        <p className="text-[9px] font-mono tracking-widest text-black/40 uppercase">
          {t.archive}
        </p>
      </div>

      {/* Bottom Right Sparkles */}
      <div className="absolute bottom-10 right-10 flex items-center gap-1 text-black opacity-70">
        <Sparkles className="w-5 h-5 stroke-[1.5]" />
      </div>

    </div>
  );
};
