import React, { useState } from 'react';
import { MapPin, Clock, Navigation, Check, Copy, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from '../icons/InstagramIcon';
import { STUDIO_CONFIG } from '../../config/studio';
import { Language, TRANSLATIONS } from '../../i18n/translations';

interface StudioTabProps {
  language: Language;
}

export const StudioTab: React.FC<StudioTabProps> = ({ language }) => {
  const t = TRANSLATIONS[language].studio;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO_CONFIG.address.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-full h-auto lg:h-full w-full flex flex-col justify-between p-4 sm:p-8 select-none space-y-4">
      
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <span className="text-[10px] font-mono tracking-widest text-black/50 uppercase">
          {t.badge}
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl text-black font-normal tracking-wide">
          {t.title}
        </h2>
        <p className="text-xs text-black/60 font-light">
          {t.subtitle}
        </p>
      </div>

      {/* Main Grid Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch max-w-6xl w-full mx-auto my-1 lg:my-3">
        
        {/* Left Card: Address & Operating Hours */}
        <div className="lg:col-span-5 bg-white border border-black/15 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            {/* Address */}
            <div className="border-b border-black/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black/50">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t.addressLabel}</span>
              </div>
              <h3 className="font-editorial text-xl text-black mt-1 font-semibold">
                Poseclub Studio Fullerton
              </h3>
              <p className="text-xs text-black/80 font-light mt-1 leading-relaxed">
                {STUDIO_CONFIG.address.street}<br />
                {STUDIO_CONFIG.address.cityStateZip}<br />
                {STUDIO_CONFIG.address.country}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/20 bg-black/5 hover:bg-black/10 text-xs font-mono text-black transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 opacity-60" />
                      <span>{t.copy}</span>
                    </>
                  )}
                </button>

                <a
                  href={STUDIO_CONFIG.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-black/85 text-xs font-medium transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{t.openMaps}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-black/50">
                <Clock className="w-3 h-3" />
                <span>{t.hoursLabel}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {STUDIO_CONFIG.hours.map((h, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-black/5 pb-1">
                    <span className="text-black/70">{h.days}</span>
                    <span className="font-mono text-black font-medium">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instagram Follow Bar */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <InstagramIcon className="w-4 h-4 text-black" />
              <span className="text-xs font-mono font-medium text-black">
                {STUDIO_CONFIG.instagram.handle}
              </span>
            </div>
            <a
              href={STUDIO_CONFIG.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full border border-black/30 hover:border-black text-[11px] font-mono uppercase tracking-wider text-black transition-colors"
            >
              {t.follow}
            </a>
          </div>
        </div>

        {/* Right Card: Google Maps & Highlight Badges */}
        <div className="lg:col-span-7 bg-white border border-black/15 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          {/* Map & Visual */}
          <div className="w-full relative h-[220px] sm:h-[260px] lg:h-auto lg:flex-1 bg-[#EFECE6] flex items-center justify-center overflow-hidden">
            <iframe
              title="Poseclub Fullerton Map"
              src={STUDIO_CONFIG.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              className="w-full h-full relative z-10"
            />
            {/* Ambient Pin & Direct Action */}
            <div className="absolute bottom-3 right-3 z-20">
              <a
                href={STUDIO_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-mono tracking-wider uppercase shadow-md hover:bg-black/85 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{t.largeMapBtn}</span>
              </a>
            </div>
          </div>
          {/* Bottom highlights */}
          <div className="p-4 bg-[#FAF8F5] border-t border-black/10 grid grid-cols-3 gap-3 text-center">
            {t.highlights.map((h, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-black">{h.title}</p>
                <p className="text-[10px] text-black/60 mt-0.5">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Center Brand Signature */}
      <div className="w-full flex items-center justify-center gap-3 pt-1">
        <div className="w-10 h-[1px] bg-black/20" />
        <span className="font-script text-xl text-black/70">poseclub</span>
        <span className="font-editorial text-xs tracking-widest text-black/50 uppercase">studio</span>
        <div className="w-10 h-[1px] bg-black/20" />
      </div>

    </div>
  );
};
