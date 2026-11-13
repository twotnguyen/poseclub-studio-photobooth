import React from 'react';
import { Camera, Layout, Download, Sparkles, ArrowRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../i18n/translations';

interface GuideTabProps {
  language: Language;
  onStartBooth: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({ language, onStartBooth }) => {
  const t = TRANSLATIONS[language].guide;
  const icons = [Layout, Camera, Download];
  const steps = t.steps.map((s, i) => ({ ...s, icon: icons[i] }));

  return (
    <div className="min-h-full h-auto md:h-full w-full flex flex-col justify-between p-4 sm:p-10 select-none space-y-4">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <p className="text-[10px] font-mono tracking-[0.3em] text-black/50 uppercase">
          {t.badge}
        </p>
        <h2 className="text-2xl sm:text-4xl text-black font-light">
          {t.title} <span className="font-script text-4xl sm:text-6xl text-black ml-1">Poseclub</span>
        </h2>
        <p className="text-xs text-black/60 font-light">
          {t.subtitle}
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full mx-auto my-auto py-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-black/15 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-black transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-black/30 group-hover:text-black transition-colors">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-full border border-black/15 bg-[#FAF8F5] flex items-center justify-center text-black">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="font-editorial text-xl text-black font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-xs font-mono text-black/50 uppercase mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                <p className="text-xs text-black/75 font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center gap-1 text-[11px] font-mono text-black/50 group-hover:text-black">
                <span>{t.stepPrefix} {step.num}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Button */}
      <div className="text-center pt-2 pb-2">
        <button
          onClick={onStartBooth}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono tracking-widest uppercase transition-all shadow-md hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.ctaBtn}</span>
        </button>
      </div>

      {/* Bottom Brand Signature */}
      <div className="w-full flex items-center justify-center gap-3">
        <div className="w-10 h-[1px] bg-black/20" />
        <span className="font-script text-xl text-black/70">poseclub</span>
        <span className="font-editorial text-xs tracking-widest text-black/50 uppercase">studio</span>
        <div className="w-10 h-[1px] bg-black/20" />
      </div>

    </div>
  );
};
