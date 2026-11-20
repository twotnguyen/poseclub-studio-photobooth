import React, { useEffect } from 'react';
import { Check, Download, Minus, Plus, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { isStripComplete } from '../strip';
import { useBooth } from '../BoothContext';

export const ConfirmStep: React.FC = () => {
  const {
    t, shots, totalShots, getFilterStyle, renderCustomFrame, printCopies, setPrintCopies,
    goToRetake, exportError, isExporting, downloadSuccess, singlesDownloaded,
    handleDownload, handleDownloadSingles, handlePrint, startNewStrip, backToHome, goTo,
  } = useBooth();

  useEffect(() => {
    if (!isStripComplete(shots, totalShots)) goTo('frame');
  }, [shots, totalShots, goTo]);

  return (
    <div className="h-full flex flex-col justify-between pb-2">
      <div className="text-center space-y-0.5 sm:space-y-1 py-1">
        <h2 className="font-editorial text-xl sm:text-4xl text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
          {t.step4Title}
        </h2>
        <p className="text-[11px] sm:text-xs text-black/50 font-mono tracking-wider">
          {t.step4Subtitle}
        </p>
      </div>

      <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-center py-1 md:py-2">
        <div className="md:col-span-6 space-y-2 md:space-y-5 bg-white border border-black/15 rounded-2xl p-3 md:p-5 shadow-sm">
          <div className="flex justify-center md:hidden">
            {renderCustomFrame('w-20')}
          </div>

          <div className="space-y-1 md:space-y-2 border-b border-black/10 pb-2 md:pb-4">
            <label className="text-xs font-mono uppercase tracking-widest text-black/60">
              {t.quantityLabel}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                className="w-9 h-9 rounded-full border border-black/30 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xl font-bold text-black min-w-[24px] text-center">
                {printCopies}
              </span>
              <button
                onClick={() => setPrintCopies(Math.min(20, printCopies + 1))}
                className="w-9 h-9 rounded-full border border-black/30 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono text-black/50 ml-2">{t.stripUnit}</span>
            </div>
          </div>

          <div className="space-y-1 md:space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-black/60">
              {t.singleRetakeLabel}
            </label>
            <div className="grid grid-cols-4 gap-1 md:gap-2">
              {shots.map((shot, idx) => (
                <div key={idx} className="group relative aspect-[4/3] rounded border border-black/20 bg-stone-100 overflow-hidden">
                  <img src={shot} alt={`Thumb ${idx + 1}`} style={getFilterStyle()} className="w-full h-full object-cover" />
                  <button
                    onClick={() => goToRetake(idx)}
                    className="absolute inset-0 bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[8px] font-mono uppercase">{t.changePhoto}</span>
                  </button>
                  <span className="absolute top-0.5 left-1 text-[8px] font-mono text-white/80 bg-black/50 px-1 rounded">
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {exportError && <p className="text-xs text-red-600 font-mono">{exportError}</p>}

          <div className="space-y-1 pt-1 md:space-y-2 md:pt-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-2 md:py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.downloadSuccess}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadBtn}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSingles}
              disabled={isExporting}
              className="w-full py-1.5 md:py-2.5 rounded-full border border-black/30 hover:border-black text-black hover:bg-black/5 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {singlesDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
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
              className="w-full py-1.5 md:py-2.5 rounded-full border border-black/30 hover:border-black text-black hover:bg-black/5 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBtn}</span>
            </button>
          </div>
        </div>

        <div className="hidden md:col-span-6 md:flex justify-center">
          {renderCustomFrame('w-56')}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
        <button
          onClick={() => { startNewStrip(); goTo('frame'); }}
          className="text-xs font-mono text-black/60 hover:text-black tracking-wider uppercase flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.newStripBtn}</span>
        </button>

        <button
          onClick={backToHome}
          className="px-6 py-2 rounded-full border border-black/30 hover:border-black text-xs font-mono tracking-wider uppercase transition-colors"
        >
          {t.returnHomeBtn}
        </button>
      </div>
    </div>
  );
};
