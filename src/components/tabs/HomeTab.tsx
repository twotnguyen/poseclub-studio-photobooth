import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../i18n/translations';

interface HomeTabProps {
  language: Language;
  onStart: () => void;
  onGoToStudio: () => void;
}

const GALLERY_ITEMS = [
  { id: 'photowall-gold-frame', src: '/images/photowall-gold-frame.jpg', rotate: -2 },
  { id: 'props-headbands', src: '/images/props-headbands.jpg', rotate: 1.5 },
  { id: 'booth-frame-menu', src: '/images/booth-frame-menu.jpg', rotate: -1 },
  { id: 'props-clips-glasses', src: '/images/props-clips-glasses.jpg', rotate: 2 },
  { id: 'photowall-plushie', src: '/images/photowall-plushie.jpg', rotate: -1.5 },
  { id: 'props-glasses-shelf', src: '/images/props-glasses-shelf.jpg', rotate: 1 },
];

export const HomeTab: React.FC<HomeTabProps> = ({ language, onStart, onGoToStudio }) => {
  const t = TRANSLATIONS[language].home;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isLightboxOpen = selectedIdx !== null;

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIdx(null);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : GALLERY_ITEMS.length - 1));
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev !== null && prev < GALLERY_ITEMS.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !root.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !root.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isLightboxOpen]);
  return (
    <div className="h-full w-full flex flex-col items-center justify-between p-4 sm:p-12 relative overflow-hidden select-none">
      
      {/* Top Left Sparkles */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-10 flex flex-col items-center gap-1 text-black opacity-85">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.5]" />
        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest opacity-60">EST. 2024</span>
      </div>

      {/* Top Right Camera Doodle */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-12 text-black opacity-80 hover:rotate-6 transition-transform">
        <div className="w-10 h-8 sm:w-12 sm:h-9 border-2 border-black rounded-lg flex items-center justify-center relative shadow-sm">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-black" />
          <div className="absolute -top-1.5 left-2 w-3 h-1 bg-black rounded-sm" />
          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-black rounded-full" />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Main Center Content */}
      <div className="text-center space-y-4 max-w-3xl mx-auto my-auto">
        <p className="text-xs sm:text-sm font-mono tracking-[0.35em] text-black/70 uppercase">
          {t.studio}
        </p>

        {/* Large Signature Script */}
        <h1 className="font-script text-6xl sm:text-8xl md:text-9xl text-black leading-none drop-shadow-sm py-1 sm:py-2">
          Poseclub
        </h1>

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

      {/* Studio Glimpse: Polaroid Gallery */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center my-auto py-2 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-black/50 uppercase">
            ✦ {t.galleryBadge}
          </span>
          <span className="hidden sm:inline-block text-black/30">•</span>
          <span className="hidden sm:inline-block text-[9px] font-mono tracking-wider text-black/40">
            {t.galleryHint}
          </span>
        </div>

        {/* 6 Polaroid Thumbnails */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4 px-2 overflow-x-auto max-w-full py-1">
          {GALLERY_ITEMS.map((item, index) => {
            const meta = t.gallery.find((g) => g.id === item.id) || { title: '', subtitle: '' };
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setSelectedIdx(index);
                }}
                className="group relative flex-shrink-0 flex flex-col items-center p-1 sm:p-1.5 bg-white border border-black/15 rounded-md shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/30"
                style={{ transform: `rotate(${item.rotate}deg)` }}
                title={`${meta.title} — ${t.galleryHint}`}
              >
                <div className="w-[3.25rem] h-[4.25rem] sm:w-16 sm:h-[5.5rem] md:w-20 md:h-[6.5rem] overflow-hidden rounded-[2px] bg-black/5 relative">
                  <img
                    src={item.src}
                    alt={meta.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-mono text-white bg-black/70 px-1 py-0.5 rounded backdrop-blur-sm">
                      ✦
                    </span>
                  </div>
                </div>
                <span className="mt-1 font-script text-[10px] sm:text-xs text-black/60 group-hover:text-black leading-none">
                  studio
                </span>
              </button>
            );
          })}
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
      {/* Full-Screen Lightbox Modal for Color Viewing */}
      {selectedIdx !== null && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-opacity animate-fadeIn"
          onClick={() => setSelectedIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t.galleryBadge}
        >
          {/* Close button top right */}
          <button
            type="button"
            ref={closeButtonRef}
            autoFocus
            onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-all z-20 backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95"
            aria-label={t.galleryClose}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : GALLERY_ITEMS.length - 1));
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-all z-20 backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95"
            aria-label={t.galleryPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIdx((prev) => (prev !== null && prev < GALLERY_ITEMS.length - 1 ? prev + 1 : 0));
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-all z-20 backdrop-blur-sm shadow-lg hover:scale-105 active:scale-95"
            aria-label={t.galleryNext}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Centered Modal Card: clicking inside DOES NOT close */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl md:max-w-2xl w-full max-h-[92vh] flex flex-col items-center bg-[#FAF8F5] rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-4 animate-scaleUp overflow-hidden"
          >
            {/* Full Color Image Container */}
            <div className="w-full flex items-center justify-center max-h-[68vh] sm:max-h-[72vh] overflow-hidden rounded-xl bg-black/5">
              <img
                src={GALLERY_ITEMS[selectedIdx].src}
                alt={t.gallery[selectedIdx]?.title || ''}
                className="max-h-[68vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Caption & Metadata Bar */}
            <div className="w-full pt-3 pb-1 px-2 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-script text-lg text-black/70">poseclub</span>
                  <span className="text-[10px] font-mono tracking-widest text-black/40 uppercase">studio</span>
                </div>
                <h3 className="font-editorial text-lg sm:text-xl text-black font-semibold tracking-wide truncate">
                  {t.gallery[selectedIdx]?.title}
                </h3>
                <p className="text-xs text-black/60 font-light truncate">
                  {t.gallery[selectedIdx]?.subtitle}
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-black/60 px-3 py-1 rounded-full border border-black/15 bg-white/60">
                  0{selectedIdx + 1} / 0{GALLERY_ITEMS.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
