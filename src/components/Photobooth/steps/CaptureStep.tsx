import React from 'react';
import { ArrowLeft, Camera, RefreshCw, SwitchCamera, Upload } from 'lucide-react';
import { isStripComplete } from '../strip';
import type { FilterType } from '../types';
import { useBooth } from '../BoothContext';

export const CaptureStep: React.FC = () => {
  const {
    t, filter, setFilter, videoRef, fileInputRef, cameraActive, cameraError, facingMode, isMirror, setIsMirror,
    countdownDuration, setCountdownDuration, countdown, isFlashing, toggleCameraFacing,
    startCamera, triggerCapture, shots, currentShotIndex, retakeIndex, isSessionActive,
    uploadError, handleFileUpload, goTo, totalShots, cameraRatio, renderCustomFrame, getFilterStyle,
  } = useBooth();

  return (
    <div className="h-full flex flex-col justify-between pb-1">
      <div className="text-center space-y-0.5 pt-0.5 sm:pt-1">
        <h2 className="font-editorial text-xl sm:text-3xl text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
          {t.step3Title}
        </h2>
        <p className="text-[11px] text-black/50 font-mono tracking-wider">
          {retakeIndex !== null
            ? `${t.step3SubtitleRetake} 0${retakeIndex + 1}`
            : `${t.step3SubtitleNormal} 0${Math.min(currentShotIndex + 1, totalShots)}/0${totalShots}`}
        </p>
        {uploadError && <p className="text-[11px] text-red-600 font-mono">{uploadError}</p>}
      </div>
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2 py-0.5">
        <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-widest text-black/50">
          {t.filterLabel}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {t.filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as FilterType)}
              className={`px-2 sm:px-3 py-1 rounded-full border text-[9px] sm:text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                filter === item.id
                  ? 'border-black bg-black text-white shadow-sm'
                  : 'border-black/20 bg-stone-50 hover:border-black/50 text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto my-auto flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-5 items-center px-2 sm:px-4 min-h-0">
        <div className="order-2 md:hidden w-full flex items-center justify-center gap-2 py-1 overflow-x-auto">
          {renderCustomFrame('w-[120px]')}
        </div>

        <div className="order-3 md:order-1 hidden md:flex md:col-span-5 lg:col-span-4 flex-col items-center justify-center">
          {renderCustomFrame('w-[190px] lg:w-[210px]')}
        </div>

        <div className="order-1 md:order-2 w-full md:col-span-7 lg:col-span-8 flex flex-col items-center justify-center">
          <div
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black bg-black shadow-2xl flex items-center justify-center"
            style={{ aspectRatio: cameraRatio, height: 'min(46vh, 370px)' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={getFilterStyle()}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isMirror ? '-scale-x-100' : 'scale-x-100'
              } ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {isFlashing && (
              <div className="absolute inset-0 bg-white z-40 animate-flash pointer-events-none" />
            )}

            {countdown !== null && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                  <span className="font-editorial text-6xl text-white font-bold">{countdown}</span>
                </div>
              </div>
            )}

            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsMirror(!isMirror)}
                className="p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                title={t.mirrorTip}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCountdownDuration(countdownDuration === 3 ? 5 : 3)}
                className="px-2 sm:px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] sm:text-[11px] font-mono hover:bg-black transition-colors cursor-pointer"
              >
                {countdownDuration}s
              </button>
              <button
                onClick={toggleCameraFacing}
                className="p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                title={facingMode === 'user' ? t.cameraBack : t.cameraFront}
              >
                <SwitchCamera className="w-3.5 h-3.5" />
              </button>
            </div>

            {!cameraActive && cameraError && (
              <div className="absolute inset-0 z-20 bg-stone-900 p-6 flex flex-col items-center justify-center text-center space-y-3 text-white">
                <Camera className="w-10 h-10 opacity-60" />
                <p className="text-xs max-w-sm text-stone-300">{cameraError || t.cameraError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-stone-200"
                  >
                    {t.retryCamera}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-white/40 text-white text-xs rounded-full hover:bg-white/10"
                  >
                    {t.uploadBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-1 pb-1">
        <button
          onClick={() => goTo('theme')}
          disabled={isSessionActive}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/40 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black disabled:opacity-40 cursor-pointer"
          title={t.back}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept="image/*"
          className="hidden"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSessionActive}
            className="px-4 py-2.5 rounded-full border border-black/30 hover:border-black text-xs font-mono text-black transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadBtn}</span>
          </button>

          {isStripComplete(shots, totalShots) && !isSessionActive && (
            <button
              onClick={() => goTo('confirm')}
              className="px-5 py-2.5 rounded-full border border-black/40 bg-white hover:bg-black hover:text-white text-xs font-mono tracking-wider uppercase transition-all shadow-sm cursor-pointer"
            >
              {t.viewStrip}
            </button>
          )}

          <button
            onClick={triggerCapture}
            disabled={isSessionActive || !cameraActive}
            className="px-8 py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-40 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{isSessionActive ? t.capturing : t.captureBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
