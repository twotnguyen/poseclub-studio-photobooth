import React, { useState } from 'react';
import { Sparkles, Camera, ArrowLeft, RefreshCw, Upload, Download, Printer, Check, Plus, Minus, RotateCcw, SwitchCamera } from 'lucide-react';
import { sounds } from '../Photobooth/SoundEffects';
import { renderPhotostripToCanvas, renderIndividualPhoto, downloadCanvas, printCanvas } from '../Photobooth/CanvasExporter';
import type { FilterType, FrameTheme } from '../Photobooth/types';
import { getLayoutForStyle, getLayoutSpec } from '../Photobooth/layouts';
import { getFilterCss } from '../Photobooth/color';
import { Language, TRANSLATIONS } from '../../i18n/translations';
import { FrameMockup } from '../Photobooth/FrameMockup';
import { ThemedFramePreview } from '../Photobooth/ThemedFramePreview';
import { ALL_THEMES, CUSTOM_FRAMES, getThemesForStyle } from '../Photobooth/FrameThemes';
import { buildUploadedShots } from '../Photobooth/upload';
import { isStripComplete } from '../Photobooth/strip';
interface BoothTabProps {
  language: Language;
  onBackToHome: () => void;
}

export type BoothWorkflowStep = 'frame-select' | 'filter-select' | 'camera' | 'confirm';

export const BoothTab: React.FC<BoothTabProps> = ({ language, onBackToHome }) => {
  const t = TRANSLATIONS[language].booth;
  // Workflow step
  const [step, setStep] = useState<BoothWorkflowStep>('frame-select');

  // Configuration
  const [selectedStyle, setSelectedStyle] = useState<number>(4); // Default Style 4 (Classic 2x4 Grid)
  const layout = getLayoutForStyle(selectedStyle);
  const styleThemes = CUSTOM_FRAMES.filter((t) => t.style === selectedStyle);
  const [filter, setFilter] = useState<FilterType>('bw-contrast');
  const [theme, setTheme] = useState<FrameTheme>(() => getThemesForStyle(4)[0].id);
  const currentTheme = styleThemes.find((t) => t.id === theme) ?? styleThemes[0];
  const isCustomImage = !!currentTheme.imagePath;
  // A custom PNG frame defines its own photo slots; the CSS fallback uses the layout spec.
  const totalShots = isCustomImage && currentTheme.slots ? currentTheme.slots.length : getLayoutSpec(layout).slots;
  const cameraRatio = isCustomImage && currentTheme.slots?.length
    ? `${currentTheme.slots[0].w} / ${currentTheme.slots[0].h}`
    : '4 / 3';
  const availableThemes = styleThemes;
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [customText, setCustomText] = useState<string>('');
  const [singlesDownloaded, setSinglesDownloaded] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Camera & Capture states
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const shotIndexRef = React.useRef(0);
  const retakeRef = React.useRef<number | null>(null);
  const captureFnRef = React.useRef<() => void>(() => {});
  const sessionRef = React.useRef(false);
  const cameraGenerationRef = React.useRef(0);
  const countdownTimerRef = React.useRef<number | null>(null);
  const timeoutsRef = React.useRef<number[]>([]);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [countdownDuration, setCountdownDuration] = useState<3 | 5>(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Photos
  const [shots, setShots] = useState<string[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Export states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const clearCaptureTimers = React.useCallback(() => {
    if (countdownTimerRef.current !== null) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scheduleTimeout = React.useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  // Camera stream handler
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    const generation = ++cameraGenerationRef.current;
    let stream: MediaStream | null = null;
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          facingMode: facingMode,
        },
        audio: false,
      });
      if (generation !== cameraGenerationRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      stream?.getTracks().forEach((t) => t.stop());
      if (generation !== cameraGenerationRef.current) return;
      streamRef.current = null;
      console.error('Camera access error:', err);
      setCameraError(TRANSLATIONS[language].booth.cameraError);
      setCameraActive(false);
    }
  }, [facingMode, language]);

  const toggleCameraFacing = React.useCallback(() => {
    setFacingMode((prev) => {
      const next = prev === 'user' ? 'environment' : 'user';
      setIsMirror(next === 'user');
      return next;
    });
  }, []);

  const stopCamera = React.useCallback(() => {
    cameraGenerationRef.current += 1;
    clearCaptureTimers();
    sessionRef.current = false;
    setCountdown(null);
    setIsSessionActive(false);
    setIsFlashing(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, [clearCaptureTimers]);

  // When step changes to 'camera', start camera. When leaving, stop camera.
  React.useEffect(() => {
    if (step === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  const snapFrame = React.useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isMirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirror]);

  // Store a shot, then advance the strip or return to confirm.
  const finishShot = React.useCallback((photoData: string) => {
    const retakeIdx = retakeRef.current;
    const target = retakeIdx ?? shotIndexRef.current;
    setShots((prev) => {
      const next = [...prev];
      next[target] = photoData;
      return next;
    });

    if (retakeIdx !== null) {
      retakeRef.current = null;
      setRetakeIndex(null);
      sessionRef.current = false;
      setIsSessionActive(false);
      setStep('confirm');
      return;
    }

    if (shotIndexRef.current < totalShots - 1) {
      shotIndexRef.current += 1;
      setCurrentShotIndex(shotIndexRef.current);
      scheduleTimeout(() => captureFnRef.current(), 1000);
    } else {
      sessionRef.current = false;
      setIsSessionActive(false);
      scheduleTimeout(() => setStep('confirm'), 600);
    }
  }, [totalShots, scheduleTimeout]);

  // The recurring timer must reach the newest callback; a captured closure
  // would keep reading shot index 0 and overwrite the same photo forever.
  const triggerCapture = React.useCallback(() => {
    if (sessionRef.current || !streamRef.current) return;
    sessionRef.current = true;
    setIsSessionActive(true);
    let secondsLeft = countdownDuration;
    setCountdown(secondsLeft);
    sounds.playCountdownTick();

    countdownTimerRef.current = window.setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setCountdown(secondsLeft);
        sounds.playCountdownTick();
        return;
      }
      if (countdownTimerRef.current !== null) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCountdown(null);
      setIsFlashing(true);
      sounds.playShutterSound();
      scheduleTimeout(() => setIsFlashing(false), 220);

      const photoData = snapFrame();
      if (photoData) {
        finishShot(photoData);
      } else {
        sessionRef.current = false;
        setIsSessionActive(false);
      }
    }, 1000);
  }, [countdownDuration, snapFrame, finishShot, scheduleTimeout]);

  captureFnRef.current = triggerCapture;

  const startRetake = (idx: number) => {
    retakeRef.current = idx;
    setRetakeIndex(idx);
    captureFnRef.current();
  };

  const startNewStrip = () => {
    shotIndexRef.current = 0;
    retakeRef.current = null;
    sessionRef.current = false;
    setCurrentShotIndex(0);
    setRetakeIndex(null);
    setShots([]);
  };

  // Live preview of the chosen frame PNG with shots placed in their photo slots.
  const renderCustomFrame = (widthClass: string) => {
    const slots = currentTheme.slots ?? [];
    const fw = currentTheme.imageWidth ?? 1240;
    const fh = currentTheme.imageHeight ?? 1844;
    const hasAnyShot = shots.some(Boolean);
    return (
      <div className={`relative ${widthClass}`}>
        {slots.map((box, i) => shots[i] && (
          <img
            key={i}
            src={shots[i]}
            alt={`Shot ${i + 1}`}
            onClick={() => { if (!isSessionActive) startRetake(i); }}
            className="absolute object-cover cursor-pointer"
            style={{
              left: `${(box.x / fw) * 100}%`,
              top: `${(box.y / fh) * 100}%`,
              width: `${(box.w / fw) * 100}%`,
              height: `${(box.h / fh) * 100}%`,
              ...getFilterStyle(),
            }}
          />
        ))}
        <img
          src={currentTheme.imagePath}
          alt={currentTheme.nameEn}
          className={`block w-full h-auto ${hasAnyShot ? 'pointer-events-none' : ''}`}
        />
      </div>
    );
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length !== totalShots) {
      setUploadError(t.uploadCountError.replace('{count}', String(totalShots)));
      e.target.value = '';
      return;
    }

    setUploadError(null);
    try {
      const dataUrls = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      })));
      const shots = buildUploadedShots(dataUrls, totalShots);
      if (!shots) {
        setUploadError(t.uploadFailed);
        return;
      }
      setShots(shots);
      setStep('confirm');
    } catch {
      setUploadError(t.uploadFailed);
    } finally {
      e.target.value = '';
    }
  };

  // Export handlers
  const handleDownload = async () => {
    if (!isStripComplete(shots, totalShots)) {
      setExportError(t.stripIncomplete);
      return;
    }
    setIsExporting(true);
    setExportError(null);
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        layout,
        theme: currentTheme.id,
        filter,
        brandName: 'poseclub studio',
        customFooterText: customText.trim(),
        location: 'Fullerton, CA',
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadCanvas(canvas, `poseclub-photostrip-${timestamp}.png`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setExportError(t.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSingles = async () => {
    if (!isStripComplete(shots, totalShots)) {
      setExportError(t.stripIncomplete);
      return;
    }
    setIsExporting(true);
    setExportError(null);
    try {
      for (let i = 0; i < shots.length; i++) {
        const singleCanvas = await renderIndividualPhoto(
          shots[i],
          i,
          filter,
          customText.trim() || 'poseclub studio',
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        );
        downloadCanvas(singleCanvas, `poseclub-individual-0${i + 1}-${Date.now()}.png`);
        await new Promise((r) => setTimeout(r, 250));
      }
      setSinglesDownloaded(true);
      setTimeout(() => setSinglesDownloaded(false), 2500);
    } catch (err) {
      console.error(err);
      setExportError(t.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    if (isExporting || !isStripComplete(shots, totalShots)) {
      if (!isExporting) setExportError(t.stripIncomplete);
      return;
    }
    setIsExporting(true);
    setExportError(null);
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        layout,
        theme: currentTheme.id,
        filter,
        brandName: 'poseclub studio',
        customFooterText: customText.trim(),
        location: 'Fullerton, CA',
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
      printCanvas(canvas, printCopies);
    } catch (err) {
      console.error(err);
      setExportError(t.exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const getFilterStyle = (): React.CSSProperties => ({ filter: getFilterCss(filter) });

  return (
    <div className="min-h-full h-auto md:h-full w-full flex flex-col justify-between p-3 sm:p-7 select-none">
      
      {/* ----------------- SUB-STEP 1: SELECT A FRAME (Slide 2) ----------------- */}
      {step === 'frame-select' && (
        <div className="min-h-full h-auto md:h-full flex flex-col justify-between pb-1">
          <div className="text-center space-y-0.5 sm:space-y-1 py-1">
            <h2 className="font-editorial text-xl sm:text-4xl text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
              {t.step1Title}
            </h2>
            <p className="text-[11px] sm:text-xs text-black/50 font-mono tracking-wider">
              {t.step1Subtitle}
            </p>
          </div>

          {/* 6 Styles Grid from Canva Slide 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-5 max-w-4xl w-full mx-auto my-auto py-1">
            {[
              { id: 1, title: 'STYLE 1', desc: '1 Photo Polaroid' },
              { id: 2, title: 'STYLE 2', desc: '2 Photos Strip (1x2)' },
              { id: 3, title: 'STYLE 3', desc: '4 Photos Grid (2x2)' },
              { id: 4, title: 'STYLE 4', desc: '8 Photos Grid (2x4)' },
              { id: 5, title: 'STYLE 5', desc: '6 Photos Landscape (2x3)' },
              { id: 6, title: 'STYLE 6', desc: '9 Photos Grid (3x3)' },
            ].map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => { setSelectedStyle(style.id); setTheme(getThemesForStyle(style.id)[0].id); }}
                  className={`relative p-2 sm:p-3.5 rounded-[18px] sm:rounded-[26px] bg-white transition-all flex flex-col items-center justify-between text-center group cursor-pointer ${
                    isSelected
                      ? 'border-2 border-black shadow-xl scale-102 ring-2 ring-black/15 bg-black/[0.015]'
                      : 'border border-black hover:border-2 hover:border-black hover:shadow-md'
                  }`}
                >
                  {/* Style Header */}
                  <p className="font-serif text-sm tracking-[0.2em] uppercase font-medium text-black pt-0.5">
                    {style.title}
                  </p>

                  {/* Accurate Canva Overlapping Mockup */}
                  <div className="my-1 flex items-center justify-center">
                    <FrameMockup styleId={style.id} />
                  </div>

                  {/* Style Subtitle */}
                  <p className="text-[10px] font-mono text-black/50 uppercase pb-0.5">
                    {t.styles.find(s => s.id === style.id)?.desc || style.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Back & Next Button Matching Canva Slide 2 */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-1 pb-1">
            <button
              onClick={onBackToHome}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-black/60 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-sm cursor-pointer group"
              title={t.back}
            >
              <span className="text-[8px] sm:text-[9px] font-serif uppercase tracking-widest leading-none">{t.back.toUpperCase()}</span>
              <span className="text-[10px] sm:text-xs leading-none mt-0.5 sm:mt-1 group-hover:-translate-x-0.5 transition-transform">←</span>
            </button>

            {/* Brand signature (Canva slide 2 style - hidden on extra small mobile) */}
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.3em] text-black/50 uppercase">POSECLUB</span>
              <span className="font-script text-xl sm:text-2xl text-black -mt-1">studio</span>
              <div className="w-12 sm:w-16 h-[1px] bg-black/20 mt-0.5" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setStep('filter-select')}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-[11px] sm:text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>{t.next}</span>
                <span>✦</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-STEP 2: CHOOSE FILTER & FRAME (Slide 3 & 6) ----------------- */}
      {step === 'filter-select' && (
        <div className="min-h-full h-auto md:h-full flex flex-col justify-between pb-1">
          <div className="text-center space-y-0.5 sm:space-y-1 py-1">
            <h2 className="font-editorial text-xl sm:text-4xl text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
              {t.step2Title}
            </h2>
            <p className="text-[11px] sm:text-xs text-black/50 font-mono tracking-wider">
              {t.step2Subtitle}
            </p>
          </div>

          {/* CENTER: Themed Frame Preview with Left/Right Carousel (< >) */}
          <div className="flex-1 flex items-center justify-center my-auto py-1 min-h-0">
            <ThemedFramePreview
              theme={theme}
              onThemeChange={setTheme}
              selectedStyle={selectedStyle}
              filter={filter}
              customText={customText}
            />
          </div>

          {/* BELOW: Controls Dock (Themes, Filters & Custom Text) */}
          <div className="max-w-4xl w-full mx-auto bg-white/95 backdrop-blur-sm border border-black/15 rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2 my-1">
            
            {/* Row 1: All 10 Themes Carousel Chips (from mysketchbooth) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/60 font-semibold">
                  {t.themeLabel}
                </label>
                <span className="text-[10px] font-mono text-black/50">
                  {language === 'vi'
                    ? ALL_THEMES.find((th) => th.id === theme)?.nameVi
                    : ALL_THEMES.find((th) => th.id === theme)?.nameEn}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {availableThemes.map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-sm font-semibold scale-102'
                          : 'border-black/20 bg-stone-50 hover:border-black/50 text-black/75'
                      }`}
                    >
                      <span>{th.icon}</span>
                      <span>{language === 'vi' ? th.nameVi : th.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Filters & Custom Text */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-black/10">
              {/* Filters */}
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/60 font-semibold">
                  {t.filterLabel}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {t.filters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as FilterType)}
                      className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        filter === f.id
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-black/20 bg-stone-50 hover:border-black/50 text-black'
                      }`}
                    >
                      <p className="text-[11px] font-semibold truncate">{f.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Text */}
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/60 font-semibold">
                  {t.customTextLabel}
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={t.customTextPlaceholder}
                  maxLength={26}
                  className="w-full px-3 py-1.5 rounded-xl border border-black/20 bg-stone-50 text-xs font-mono focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar: Back & Next Button */}
          <div className="w-full max-w-3xl mx-auto flex items-center justify-between pt-1 pb-1">
            <button
              onClick={() => setStep('frame-select')}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-black/50 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-sm cursor-pointer group"
              title={t.back}
            >
              <span className="text-[8px] font-serif uppercase tracking-widest leading-none">{t.back.toUpperCase()}</span>
              <span className="text-xs leading-none mt-0.5 group-hover:-translate-x-0.5 transition-transform">←</span>
            </button>

            {/* Brand signature (hidden on small mobile) */}
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-[8px] font-mono tracking-[0.3em] text-black/50 uppercase">POSECLUB</span>
              <span className="font-script text-xl sm:text-2xl text-black -mt-1">studio</span>
              <div className="w-14 h-[1px] bg-black/20 mt-0.5" />
            </div>

            <button
              onClick={() => {
                startNewStrip();
                setStep('camera');
              }}
              className="px-6 sm:px-8 py-2.5 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-[11px] sm:text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{t.startCapture}</span>
              <span>✦</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- SUB-STEP 3: TAKE YOUR PHOTOS (Slide 7) ----------------- */}
      {step === 'camera' && (
        <div className="min-h-full h-auto md:h-full flex flex-col justify-between pb-1">
          <div className="text-center space-y-0.5 pt-0.5 sm:pt-1">
            <h2 className="font-editorial text-xl sm:text-3xl text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
              {t.step3Title}
            </h2>
            <p className="text-[11px] text-black/50 font-mono tracking-wider">
              {retakeIndex !== null
                ? `${t.step3SubtitleRetake} 0${retakeIndex + 1}`
                : `${t.step3SubtitleNormal} 0${Math.min(currentShotIndex + 1, totalShots)}/0${totalShots}`}
            </p>
            {uploadError && (
              <p className="text-[11px] text-red-600 font-mono">{uploadError}</p>
            )}
          </div>

          {/* 2-COLUMN VIEWPORT: Responsive Mobile View (Camera first, shots row, controls) */}
          <div className="flex-1 w-full max-w-5xl mx-auto my-auto flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-5 items-center px-2 sm:px-4 min-h-0">
            
            {/* Mobile Compact Horizontal Shot Preview (Order 2 on mobile, Hidden on desktop) */}
            <div className="order-2 md:hidden w-full flex items-center justify-center gap-2 py-1 overflow-x-auto">
              {isCustomImage ? renderCustomFrame('w-[120px]') : [...Array(totalShots)].map((_, idx) => {
                const hasShot = !!shots[idx];
                const isCurrent = idx === currentShotIndex && isSessionActive;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (hasShot && !isSessionActive) startRetake(idx);
                    }}
                    className={`w-14 h-14 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-emerald-500 scale-105 shadow-md'
                        : hasShot
                        ? 'border-black/40 cursor-pointer shadow-sm'
                        : 'border-black/20 bg-stone-100'
                    }`}
                    style={{
                      backgroundColor: hasShot ? '#000000' : currentTheme.slotBgDefault,
                      borderColor: currentTheme.slotBorderColor,
                    }}
                  >
                    {hasShot ? (
                      <img
                        src={shots[idx]}
                        alt={`Shot ${idx + 1}`}
                        style={getFilterStyle()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera className="w-4 h-4 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                        <span className="text-[7px] font-mono opacity-60 mt-0.5" style={{ color: currentTheme.textColor }}>
                          0{idx + 1}
                        </span>
                      </>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-500 animate-pulse pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Live Photostrip Progress Preview (Hidden on mobile, Visible on desktop) */}
            <div className="order-3 md:order-1 hidden md:flex md:col-span-5 lg:col-span-4 flex-col items-center justify-center">
              {isCustomImage ? renderCustomFrame('w-[190px] lg:w-[210px]') : (
              <div
                className="relative rounded-2xl border-2 shadow-2xl p-2.5 flex flex-col items-center justify-between transition-all duration-300"
                style={{
                  backgroundColor: currentTheme.bgColor,
                  borderColor: currentTheme.borderColor,
                  boxShadow: '0 15px 35px -5px rgba(0,0,0,0.2)',
                }}
              >
                {/* Header text bar if theme has it */}
                {currentTheme.isTextBar && (
                  <p
                    className="font-mono text-[8px] font-bold tracking-wider text-center uppercase mb-1 truncate max-w-[130px]"
                    style={{ color: currentTheme.textColor }}
                  >
                    {currentTheme.barText}
                  </p>
                )}

                {/* 1x2 or 1x4 Vertical Strip */}
                {(selectedStyle === 2 || selectedStyle === 4) && (
                  <div className="w-[110px] sm:w-[124px] space-y-1">
                    {[...Array(totalShots)].map((_, idx) => {
                      const hasShot = !!shots[idx];
                      const isCurrent = idx === currentShotIndex && isSessionActive;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (hasShot && !isSessionActive) startRetake(idx);
                          }}
                          className={`w-full h-[58px] sm:h-[62px] rounded-xs border relative overflow-hidden flex flex-col items-center justify-center transition-all ${
                            isCurrent
                              ? 'ring-2 ring-emerald-500 scale-102 shadow-md'
                              : hasShot
                              ? 'border-black/30 cursor-pointer hover:opacity-85'
                              : 'border-black/20'
                          }`}
                          style={{
                            backgroundColor: hasShot ? '#000000' : currentTheme.slotBgDefault,
                            borderColor: currentTheme.slotBorderColor,
                          }}
                          title={hasShot ? `0${idx + 1} — ${t.retakeHint}` : `0${idx + 1}`}
                        >
                          {hasShot ? (
                            <img
                              src={shots[idx]}
                              alt={`Shot ${idx + 1}`}
                              style={getFilterStyle()}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <Camera className="w-5 h-5 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                              <span className="text-[7px] font-mono opacity-50 mt-0.5" style={{ color: currentTheme.textColor }}>
                                0{idx + 1}
                              </span>
                            </>
                          )}
                          {isCurrent && (
                            <div className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-500 animate-pulse pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Polaroid Style 1 */}
                {selectedStyle === 1 && (
                  <div className="w-[190px] flex flex-col items-center">
                    <div
                      className="w-full aspect-square rounded-xs border relative overflow-hidden flex flex-col items-center justify-center"
                      style={{
                        backgroundColor: shots[0] ? '#000000' : currentTheme.slotBgDefault,
                        borderColor: currentTheme.slotBorderColor,
                      }}
                    >
                      {shots[0] ? (
                        <img
                          src={shots[0]}
                          alt="Shot 1"
                          style={getFilterStyle()}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-10 h-10 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                      )}
                    </div>
                  </div>
                )}

                {/* Grid 2x2, 2x3, 3x3 */}
                {(selectedStyle === 3 || selectedStyle === 5 || selectedStyle === 6) && (
                  <div
                    className={`grid gap-1 ${
                      selectedStyle === 3 ? 'w-[170px] grid-cols-2' : selectedStyle === 5 ? 'w-[150px] grid-cols-2' : 'w-[190px] grid-cols-3'
                    }`}
                  >
                    {[...Array(totalShots)].map((_, idx) => {
                      const hasShot = !!shots[idx];
                      const isCurrent = idx === currentShotIndex && isSessionActive;
                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded-xs border relative overflow-hidden flex flex-col items-center justify-center ${
                            isCurrent ? 'ring-2 ring-emerald-500' : ''
                          }`}
                          style={{
                            backgroundColor: hasShot ? '#000000' : currentTheme.slotBgDefault,
                            borderColor: currentTheme.slotBorderColor,
                          }}
                        >
                          {hasShot ? (
                            <img
                              src={shots[idx]}
                              alt={`Shot ${idx + 1}`}
                              style={getFilterStyle()}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera className="w-4 h-4 opacity-40 text-current" style={{ color: currentTheme.textColor }} />
                          )}
                          <span className="absolute bottom-0.5 right-1 text-[6px] font-mono opacity-50" style={{ color: currentTheme.textColor }}>
                            0{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bottom Watermark */}
                <div className="pt-2 text-center w-full">
                  <p
                    className="font-editorial text-[9px] font-bold tracking-widest uppercase truncate max-w-[130px] mx-auto"
                    style={{ color: currentTheme.textColor }}
                  >
                    {customText.trim() ? customText.trim().toUpperCase() : 'POSECLUB STUDIO'}
                  </p>
                </div>
              </div>
              )}
            </div>

            {/* RIGHT: Live Camera Viewport (Order 1 on mobile, Order 2 on desktop) */}
            <div className="order-1 md:order-2 w-full md:col-span-7 lg:col-span-8 flex flex-col items-center justify-center">
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black bg-black shadow-2xl flex items-center justify-center"
                style={{ aspectRatio: cameraRatio, height: 'min(46vh, 370px)' }}
              >
                {/* Live Video */}
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

                {/* Flash Effect */}
                {isFlashing && (
                  <div className="absolute inset-0 bg-white z-40 animate-flash pointer-events-none" />
                )}

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                      <span className="font-editorial text-6xl text-white font-bold">{countdown}</span>
                    </div>
                  </div>
                )}

                {/* Camera Controls inside overlay */}
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

                {/* Error Fallback */}
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

          {/* Bottom Bar: Action Trigger & Progress */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-1 pb-1">
            <button
              onClick={() => setStep('filter-select')}
              disabled={isSessionActive}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-black/40 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black disabled:opacity-40 cursor-pointer"
              title={t.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Hidden upload input */}
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

              {/* If user took some shots, show direct preview button */}
              {isStripComplete(shots, totalShots) && !isSessionActive && (
                <button
                  onClick={() => setStep('confirm')}
                  className="px-5 py-2.5 rounded-full border border-black/40 bg-white hover:bg-black hover:text-white text-xs font-mono tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                >
                  {t.viewStrip}
                </button>
              )}

              {/* Big Shutter Trigger Button */}
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
      )}

      {/* ----------------- SUB-STEP 4: CONFIRM & PRINT (Slide 8 & 9) ----------------- */}
      {step === 'confirm' && (
        <div className="min-h-full h-auto md:h-full flex flex-col justify-between pb-2">
          <div className="text-center space-y-0.5 sm:space-y-1 py-1">
            <h2 className="font-editorial text-xl sm:text-4xl text-black font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase">
              {t.step4Title}
            </h2>
            <p className="text-[11px] sm:text-xs text-black/50 font-mono tracking-wider">
              {t.step4Subtitle}
            </p>
          </div>

          {/* Main Grid: Left Controls, Right Preview */}
          <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center py-2">
            
            {/* Left Column: Prints Quantity & Retake Gallery */}
            <div className="md:col-span-6 space-y-5 bg-white border border-black/15 rounded-2xl p-5 shadow-sm">
              {/* Select Number of Prints */}
              <div className="space-y-2 border-b border-black/10 pb-4">
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

              {/* Single Shot Retake Thumbnails */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-black/60">
                  {t.singleRetakeLabel}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {shots.map((shot, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-[4/3] rounded border border-black/20 bg-stone-100 overflow-hidden"
                    >
                      <img
                        src={shot}
                        alt={`Thumb ${idx + 1}`}
                        style={getFilterStyle()}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          retakeRef.current = idx;
                          setRetakeIndex(idx);
                          setStep('camera');
                        }}
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

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="w-full py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
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
                  className="w-full py-2.5 rounded-full border border-black/30 hover:border-black text-black hover:bg-black/5 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="w-full py-2.5 rounded-full border border-black/30 hover:border-black text-black hover:bg-black/5 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Result Strip */}
            <div className="md:col-span-6 flex justify-center">
              {isCustomImage ? renderCustomFrame('w-56') : (
              <div
                className="w-56 p-4 rounded-xl border-2 shadow-2xl flex flex-col justify-between"
                style={{
                  backgroundColor: currentTheme.bgColor,
                  color: currentTheme.textColor,
                  borderColor: currentTheme.borderColor,
                }}
              >
                {layout === 'strip-1x4' ? (
                  <div className="space-y-2">
                    {shots.map((shot, idx) => (
                      <div
                        key={idx}
                        className="aspect-[4/3] rounded bg-stone-900 overflow-hidden border border-black/10"
                      >
                        <img
                          src={shot}
                          alt={`Shot ${idx + 1}`}
                          style={getFilterStyle()}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {shots.map((shot, idx) => (
                      <div
                        key={idx}
                        className="aspect-[4/3] rounded bg-stone-900 overflow-hidden border border-black/10"
                      >
                        <img
                          src={shot}
                          alt={`Shot ${idx + 1}`}
                          style={getFilterStyle()}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Watermark Bottom */}
                <div className="pt-3 text-center space-y-0.5">
                  <p className="font-editorial text-xs font-bold tracking-widest uppercase truncate max-w-[200px] mx-auto">
                    {customText.trim() ? customText.trim().toUpperCase() : 'POSECLUB STUDIO'}
                  </p>
                  <div className="w-8 h-[1px] bg-current opacity-30 mx-auto" />
                  <p className="text-[8px] font-mono tracking-wider opacity-70">
                    FULLERTON, CA &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              )}
            </div>

          </div>

          {/* Bottom Bar: Start New Strip */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
            <button
              onClick={() => {
                startNewStrip();
                setStep('frame-select');
              }}
              className="text-xs font-mono text-black/60 hover:text-black tracking-wider uppercase flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.newStripBtn}</span>
            </button>

            <button
              onClick={onBackToHome}
              className="px-6 py-2 rounded-full border border-black/30 hover:border-black text-xs font-mono tracking-wider uppercase transition-colors"
            >
              {t.returnHomeBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
