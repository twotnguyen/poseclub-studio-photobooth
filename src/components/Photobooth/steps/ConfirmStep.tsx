import React, { useEffect } from 'react';
import { Check, Download, Minus, Plus, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { isStripComplete } from '../strip';
import { useBooth } from '../BoothContext';

export const ConfirmStep: React.FC = () => {
  const {
    t, shots, totalShots, getFilterStyle, renderCustomFrame, currentTheme, printCopies, setPrintCopies,
    goToRetake, exportError, isExporting, downloadSuccess, singlesDownloaded,
    handleDownload, handleDownloadSingles, handlePrint, startNewStrip, backToHome, goTo,
  } = useBooth();

  useEffect(() => {
    if (!isStripComplete(shots, totalShots)) goTo('frame');
  }, [shots, totalShots, goTo]);

  const slot = currentTheme.slots?.[0];
  const thumbAspect = slot ? `${slot.w} / ${slot.h}` : '4 / 3';
  const slots = currentTheme.slots ?? [];
  const columnCount = Math.min(Math.max(new Set(slots.map((s) => Math.round(s.x / 10))).size, 1), 4);
  const isLandscapeFrame = slot ? slot.w > slot.h : false;
  const frameSizeClass = isLandscapeFrame
    ? 'w-20 sm:w-24 [@media(max-height:500px)]:w-16 lg:w-[min(46vw,520px)] xl:w-[min(64vw,670px)]'
    : 'w-20 sm:w-24 [@media(max-height:500px)]:w-16 lg:w-[min(260px,36vh)] xl:w-[min(310px,42vh)]';
  return (
    <div className="h-full flex flex-col pb-1 sm:pb-2 [@media(max-height:500px)]:pb-0">
      <div className="shrink-0 text-center pt-1 pb-1 sm:pt-2 sm:pb-3 [@media(max-height:500px)]:py-0">
        <div className="mx-auto h-px w-10 bg-[#C5A880]/60 mb-1" />
        <h2 className="font-editorial text-[clamp(22px,3vw,40px)] leading-none text-black font-medium tracking-[0.12em] sm:tracking-[0.18em] uppercase">
          {t.step4Title}
        </h2>
        <p className="mt-1 text-[10px] sm:text-[11px] [@media(max-height:500px)]:hidden text-black/45 font-mono tracking-wider">
          {t.step4Subtitle}
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full grid grid-cols-1 [@media(max-height:500px)]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 lg:gap-6 [@media(max-height:500px)]:gap-1 px-3 sm:px-8 [@media(max-height:500px)]:px-2">
        <div className="hidden xl:block" aria-hidden="true" />

        <div className="order-1 lg:order-1 xl:order-2 lg:col-start-1 xl:col-start-2 lg:translate-y-3 flex flex-col items-center justify-center min-h-0 justify-self-center">
          <div className="relative border border-[#C5A880]/45 bg-white/70 p-2.5 sm:p-4 [@media(max-height:500px)]:p-1 shadow-[0_18px_45px_rgba(12,12,12,0.09)]">
            {renderCustomFrame(frameSizeClass)}
          </div>
          <div className={`mt-2.5 [@media(max-height:500px)]:mt-1 flex ${frameSizeClass} items-center gap-2`}>
            <span className="h-px flex-1 bg-[#C5A880]/45" />
            <span className="font-script text-lg sm:text-xl leading-none text-black/70">studio</span>
            <span className="h-px flex-1 bg-[#C5A880]/45" />
          </div>
        </div>
        <aside className="order-2 lg:order-2 xl:order-3 lg:col-start-2 xl:col-start-3 justify-self-center w-full lg:w-[320px] xl:w-[360px] max-w-full min-h-0 flex flex-col gap-3 md:gap-4 [@media(max-height:500px)]:gap-1.5">
          <div className="flex items-center justify-between border-b border-black/10 pb-2 [@media(max-height:500px)]:pb-1">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50">
              {t.quantityLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                className="w-8 h-8 min-w-11 min-h-11 [@media(max-height:500px)]:min-w-8 [@media(max-height:500px)]:min-h-8 rounded-full border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-editorial text-2xl text-black min-w-[28px] text-center">
                {printCopies}
              </span>
              <button
                onClick={() => setPrintCopies(Math.min(20, printCopies + 1))}
                className="w-8 h-8 min-w-11 min-h-11 [@media(max-height:500px)]:min-w-8 [@media(max-height:500px)]:min-h-8 rounded-full border border-black/25 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-black/40 ml-1">{t.stripUnit}</span>
            </div>
          </div>

          <div className="min-h-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-black/50">
                {t.singleRetakeLabel}
              </span>
              <span className="font-mono text-[10px] text-black/35">
                {String(shots.length).padStart(2, '0')}
              </span>
            </div>
            <div className="grid gap-1.5 md:gap-2 [@media(max-height:500px)]:gap-1" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
              {shots.map((shot, idx) => (
                <div key={idx} className={`group relative border border-black/15 bg-stone-100 overflow-hidden ${columnCount === 1 ? 'h-[clamp(70px,13vh,104px)] [@media(max-height:500px)]:h-[clamp(28px,5vh,38px)]' : 'h-[clamp(52px,10vh,84px)] [@media(max-height:500px)]:h-[clamp(20px,4vh,30px)]'}`} style={{ aspectRatio: thumbAspect }}>
                  <img src={shot} alt={t.thumbAlt.replace('{n}', String(idx + 1))} decoding="async" style={getFilterStyle()} className="w-full h-full object-cover" />
                  <button
                    onClick={() => goToRetake(idx)}
                    className="absolute inset-0 bg-black/70 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="font-mono text-[8px] uppercase tracking-wider">{t.changePhoto}</span>
                  </button>
                  <span className="pointer-events-none absolute top-0.5 left-1 font-mono text-[8px] text-black/70 bg-[#FAF8F5]/85 px-1">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {exportError && <p role="alert" className="text-xs text-red-700 font-mono">{exportError}</p>}

          <div className="mt-auto space-y-2 [@media(max-height:500px)]:space-y-1">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-2.5 md:py-3 min-h-11 [@media(max-height:500px)]:py-1 [@media(max-height:500px)]:min-h-8 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-[9px] sm:text-xs font-mono uppercase tracking-normal sm:tracking-widest whitespace-nowrap transition-all ring-1 ring-black/10 ring-offset-2 ring-offset-[#FAF8F5] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.downloadSuccess}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadBtn}</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                onClick={handleDownloadSingles}
                disabled={isExporting}
                className="min-w-0 py-2 md:py-2.5 min-h-11 [@media(max-height:500px)]:py-1 [@media(max-height:500px)]:min-h-8 rounded-full border border-black/25 hover:border-black hover:bg-black/5 text-black text-[9px] sm:text-[10px] font-mono uppercase tracking-normal whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {singlesDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.downloadSuccess}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.downloadSinglesBtn.replace('{count}', String(shots.length))}</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                disabled={isExporting}
                className="px-4 py-2 md:py-2.5 min-h-11 [@media(max-height:500px)]:py-1 [@media(max-height:500px)]:min-h-8 rounded-full border border-black/25 hover:border-black hover:bg-black/5 text-black text-[9px] sm:text-[10px] font-mono uppercase tracking-normal whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printBtn}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="shrink-0 w-full flex items-center justify-between px-3 sm:px-8 pt-2 [@media(max-height:500px)]:pt-0">
        <button
          onClick={() => { startNewStrip(); goTo('frame'); }}
          className="group flex items-center gap-2 text-black/55 hover:text-black transition-colors cursor-pointer"
        >
          <span className="w-11 h-11 rounded-full border border-black/25 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-[10px] sm:text-xs tracking-wider uppercase">{t.newStripBtn}</span>
        </button>

        <button
          onClick={backToHome}
          className="px-5 sm:px-7 py-2 min-h-11 [@media(max-height:500px)]:py-1 rounded-full border border-black/30 hover:border-black hover:bg-black hover:text-white font-mono text-[10px] sm:text-xs tracking-wider uppercase transition-colors cursor-pointer"
        >
          {t.returnHomeBtn}
        </button>
      </div>
    </div>
  );
};
