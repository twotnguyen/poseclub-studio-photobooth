import React, { useState } from 'react';
import { Sparkles, Camera, ArrowLeft, RefreshCw, Upload, Download, Printer, Check, Plus, Minus, RotateCcw, Ticket, SwitchCamera } from 'lucide-react';
import { sounds } from '../Photobooth/SoundEffects';
import { renderPhotostripToCanvas, renderIndividualPhoto, downloadCanvas, printCanvas } from '../Photobooth/CanvasExporter';
import { FilterType, FrameColor, LayoutType, FrameTheme } from '../Photobooth/types';
import { Language, TRANSLATIONS } from '../../i18n/translations';
import { FrameMockup } from '../Photobooth/FrameMockup';
import { ThemedFramePreview } from '../Photobooth/ThemedFramePreview';
import { FRAME_THEMES, getThemeById } from '../Photobooth/FrameThemes';
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
  const [selectedStyle, setSelectedStyle] = useState<number>(4); // Default Style 4 (Classic 1x4 Strip)
  const totalShots = selectedStyle === 1 ? 1 : selectedStyle === 2 ? 2 : selectedStyle === 5 ? 6 : selectedStyle === 6 ? 9 : 4;
  const [layout, setLayout] = useState<LayoutType>('strip-1x4');
  const [filter, setFilter] = useState<FilterType>('bw-contrast');
  const [theme, setTheme] = useState<FrameTheme>('classic-black');
  const currentTheme = getThemeById(theme);
  const frameColor: FrameColor = theme === 'classic-white' ? 'white' : 'black';
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [customText, setCustomText] = useState<string>('');
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [singlesDownloaded, setSinglesDownloaded] = useState<boolean>(false);
  // Camera & Capture states
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  // Camera stream handler
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1440 },
          facingMode: facingMode,
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Chưa mở được camera. Bạn có thể cấp quyền hoặc bấm "Tải ảnh từ máy".');
      setCameraActive(false);
    }
  }, [facingMode]);

  const toggleCameraFacing = React.useCallback(() => {
    setFacingMode((prev) => {
      const next = prev === 'user' ? 'environment' : 'user';
      setIsMirror(next === 'user');
      return next;
    });
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

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

  // Capture countdown loop
  const triggerCapture = React.useCallback(() => {
    setIsSessionActive(true);
    let secondsLeft = countdownDuration;
    setCountdown(secondsLeft);
    sounds.playCountdownTick();

    const interval = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft > 0) {
        setCountdown(secondsLeft);
        sounds.playCountdownTick();
      } else {
        clearInterval(interval);
        setCountdown(null);

        // Flash and sound
        setIsFlashing(true);
        sounds.playShutterSound();
        setTimeout(() => setIsFlashing(false), 220);

        const photoData = snapFrame();
        if (photoData) {
          if (retakeIndex !== null) {
            // Single shot retake
            setShots((prev) => {
              const next = [...prev];
              next[retakeIndex] = photoData;
              return next;
            });
            setRetakeIndex(null);
            setIsSessionActive(false);
            setStep('confirm');
          } else {
            // Sequential shots
            setShots((prev) => {
              const next = [...prev];
              next[currentShotIndex] = photoData;

              if (currentShotIndex < totalShots - 1) {
                setCurrentShotIndex(currentShotIndex + 1);
                setTimeout(() => {
                  triggerCapture();
                }, 1000);
              } else {
                setIsSessionActive(false);
                setTimeout(() => {
                  setStep('confirm');
                }, 600);
              }
              return next;
            });
          }
        }
      }
    }, 1000);
  }, [countdownDuration, snapFrame, retakeIndex, currentShotIndex]);

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 4);
    const loadedUrls: string[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedUrls.push(event.target.result as string);
          if (loadedUrls.length === fileList.length) {
            const finalShots = [...loadedUrls];
            while (finalShots.length < 4) {
              finalShots.push(finalShots[0]);
            }
            setShots(finalShots);
            setStep('confirm');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Export handlers
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        layout,
        frameColor,
        theme,
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
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSingles = async () => {
    setIsExporting(true);
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
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        layout,
        frameColor,
        theme,
        filter,
        brandName: 'poseclub studio',
        customFooterText: customText.trim(),
        location: 'Fullerton, CA',
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
      printCanvas(canvas);
    } catch (err) {
      console.error(err);
    }
  };

  // CSS filter helper
  const getFilterStyle = (): React.CSSProperties => {
    switch (filter) {
      case 'bw-contrast':
        return { filter: 'grayscale(100%) contrast(140%) brightness(0.96)' };
      case 'bw-film':
        return { filter: 'grayscale(100%) contrast(115%) brightness(1.04) sepia(8%)' };
      case 'natural':
        return { filter: 'contrast(106%) brightness(1.02) saturate(108%)' };
      default:
        return {};
    }
  };

  const isDark = frameColor === 'black';

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
              { id: 1, title: 'STYLE 1', desc: '1 Photo Polaroid', count: 1, lay: 'grid-2x2' as LayoutType },
              { id: 2, title: 'STYLE 2', desc: '2 Photos Strip (1x2)', count: 2, lay: 'strip-1x4' as LayoutType },
              { id: 3, title: 'STYLE 3', desc: '4 Photos Grid (2x2)', count: 4, lay: 'grid-2x2' as LayoutType },
              { id: 4, title: 'STYLE 4', desc: '4 Photos Classic (1x4)', count: 4, lay: 'strip-1x4' as LayoutType },
              { id: 5, title: 'STYLE 5', desc: '6 Photos Vertical (2x3)', count: 6, lay: 'strip-1x4' as LayoutType },
              { id: 6, title: 'STYLE 6', desc: '9 Photos Grid (3x3)', count: 9, lay: 'grid-2x2' as LayoutType },
            ].map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    setLayout(style.lay);
                  }}
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
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-black/60 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-xs cursor-pointer group"
              title={t.back}
            >
              <span className="text-[8px] sm:text-[9px] font-serif uppercase tracking-widest leading-none">BACK</span>
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
                onClick={() => setShowVoucherModal(true)}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-black/60 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-xs cursor-pointer group"
                title={t.voucherBtn}
              >
                <span className="text-[7px] sm:text-[8px] font-serif uppercase tracking-widest leading-none">{t.voucherBtn}</span>
                <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 opacity-70 group-hover:opacity-100" />
              </button>

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
          <div className="max-w-4xl w-full mx-auto bg-white/95 backdrop-blur-xs border border-black/15 rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-2 my-1">
            
            {/* Row 1: All 10 Themes Carousel Chips (from mysketchbooth) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/60 font-semibold">
                  Theme Khung ảnh (10 Kiểu dáng từ Mysketchbooth)
                </label>
                <span className="text-[10px] font-mono text-black/50">
                  {FRAME_THEMES.find((th) => th.id === theme)?.nameVi}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {FRAME_THEMES.map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-xs font-semibold scale-102'
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
                          ? 'border-black bg-black text-white shadow-xs'
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
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-black/50 bg-white hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center text-black shadow-xs cursor-pointer group"
              title={t.back}
            >
              <span className="text-[8px] font-serif uppercase tracking-widest leading-none">BACK</span>
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
                setShots([]);
                setCurrentShotIndex(0);
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
          </div>

          {/* 2-COLUMN VIEWPORT: Responsive Mobile View (Camera first, shots row, controls) */}
          <div className="flex-1 w-full max-w-5xl mx-auto my-auto flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-5 items-center px-2 sm:px-4 min-h-0">
            
            {/* Mobile Compact Horizontal Shot Preview (Order 2 on mobile, Hidden on desktop) */}
            <div className="order-2 md:hidden w-full flex items-center justify-center gap-2 py-1 overflow-x-auto">
              {[...Array(totalShots)].map((_, idx) => {
                const hasShot = !!shots[idx];
                const isCurrent = idx === currentShotIndex && isSessionActive;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (hasShot && !isSessionActive) {
                        setRetakeIndex(idx);
                        triggerCapture();
                      }
                    }}
                    className={`w-14 h-14 rounded-xl border relative overflow-hidden flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-emerald-500 scale-105 shadow-md'
                        : hasShot
                        ? 'border-black/40 cursor-pointer shadow-xs'
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
                            if (hasShot && !isSessionActive) {
                              setRetakeIndex(idx);
                              triggerCapture();
                            }
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
                          title={hasShot ? `Tấm 0${idx + 1} (Bấm để chụp lại)` : `Tấm 0${idx + 1}`}
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
            </div>

            {/* RIGHT: Live Camera Viewport (Order 1 on mobile, Order 2 on desktop) */}
            <div className="order-1 md:order-2 w-full md:col-span-7 lg:col-span-8 flex flex-col items-center justify-center">
              <div className="w-full max-w-xl relative aspect-[4/3] max-h-[300px] sm:max-h-[370px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-black bg-black shadow-2xl flex items-center justify-center">
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
                    title={facingMode === 'user' ? 'Đổi sang camera sau' : 'Đổi sang camera trước'}
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
              {shots.filter(Boolean).length > 0 && !isSessionActive && (
                <button
                  onClick={() => setStep('confirm')}
                  className="px-5 py-2.5 rounded-full border border-black/40 bg-white hover:bg-black hover:text-white text-xs font-mono tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                >
                  Xem dải ảnh ✦
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
                    onClick={() => setPrintCopies(printCopies + 1)}
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
                      <span>{t.downloadSinglesBtn}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 rounded-full border border-black/30 hover:border-black text-black hover:bg-black/5 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printBtn}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Result Strip */}
            <div className="md:col-span-6 flex justify-center">
              <div
                className={`w-56 p-4 rounded-xl border-2 shadow-2xl flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#0E0E0E] text-white border-black'
                    : 'bg-[#FAF9F6] text-black border-black/30'
                }`}
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
            </div>

          </div>

          {/* Bottom Bar: Start New Strip */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setShots([]);
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
      {/* Voucher Code Keypad Modal (Canva Slide 4) */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => {
                setShowVoucherModal(false);
                setVoucherMessage(null);
              }}
              className="absolute top-4 right-4 text-black/50 hover:text-black text-xs font-mono p-1"
            >
              ✕
            </button>
            <div className="space-y-1 pt-1">
              <span className="text-[9px] font-mono tracking-widest text-black/50 uppercase">PROMOTION CODE</span>
              <h3 className="font-editorial text-xl font-medium tracking-wider text-black">
                {t.voucherTitle}
              </h3>
            </div>

            {/* Voucher Screen Display */}
            <div className="w-full h-12 border-2 border-black rounded-xl flex items-center justify-center text-xl font-mono tracking-[0.25em] bg-[#FAF8F5]">
              {voucherInput || '— — — —'}
            </div>

            {voucherMessage && (
              <p className="text-xs text-emerald-600 font-mono font-medium">{voucherMessage}</p>
            )}

            {/* Keypad 1-9 (exact Canva Slide 4 design) */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => setVoucherInput((prev) => (prev.length < 8 ? prev + num : prev))}
                  className="w-16 h-12 rounded-xl border border-black/30 hover:border-black hover:bg-black hover:text-white font-mono text-base font-semibold transition-colors cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setVoucherInput('')}
                className="w-16 h-12 rounded-xl border border-black/30 hover:bg-black/10 font-mono text-xs uppercase cursor-pointer"
              >
                CLEAR
              </button>
              <button
                onClick={() => setVoucherInput((prev) => (prev.length < 8 ? prev + '0' : prev))}
                className="w-16 h-12 rounded-xl border border-black/30 hover:border-black hover:bg-black hover:text-white font-mono text-base font-semibold cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => setVoucherMessage(t.voucherApplied)}
                className="w-16 h-12 rounded-xl border-2 border-black bg-black text-white hover:bg-black/85 font-mono text-xs font-bold cursor-pointer"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
