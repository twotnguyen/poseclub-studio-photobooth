import React, { useState } from 'react';
import { Sparkles, Camera, ArrowLeft, RefreshCw, Upload, Download, Printer, Check, Plus, Minus, RotateCcw } from 'lucide-react';
import { sounds } from '../Photobooth/SoundEffects';
import { renderPhotostripToCanvas, downloadCanvas, printCanvas } from '../Photobooth/CanvasExporter';
import { FilterType, FrameColor, LayoutType } from '../Photobooth/types';
import { Language, TRANSLATIONS } from '../../i18n/translations';

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
  const [layout, setLayout] = useState<LayoutType>('strip-1x4');
  const [filter, setFilter] = useState<FilterType>('bw-contrast');
  const [frameColor, setFrameColor] = useState<FrameColor>('black');
  const [printCopies, setPrintCopies] = useState<number>(1);

  // Camera & Capture states
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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
          facingMode: 'user',
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

              if (currentShotIndex < 3) {
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
        filter,
        brandName: 'poseclub studio',
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

  const handlePrint = async () => {
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        layout,
        frameColor,
        filter,
        brandName: 'poseclub studio',
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
    <div className="h-full w-full flex flex-col justify-between p-4 sm:p-7 overflow-hidden select-none">
      
      {/* ----------------- SUB-STEP 1: SELECT A FRAME (Slide 2) ----------------- */}
      {step === 'frame-select' && (
        <div className="h-full flex flex-col justify-between">
          <div className="text-center space-y-1">
            <h2 className="font-editorial text-2xl sm:text-4xl text-black font-medium tracking-[0.15em] uppercase">
              {t.step1Title}
            </h2>
            <p className="text-xs text-black/50 font-mono tracking-wider">
              {t.step1Subtitle}
            </p>
          </div>

          {/* 6 Styles Grid from Canva Slide 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl w-full mx-auto my-auto">
            {[
              { id: 1, title: 'STYLE 1', desc: '1 Photo Polaroid', count: 1, lay: 'grid-2x2' as LayoutType },
              { id: 2, title: 'STYLE 2', desc: '2 Photos Strip (1x2)', count: 2, lay: 'strip-1x4' as LayoutType },
              { id: 3, title: 'STYLE 3', desc: '4 Photos Grid (2x2)', count: 4, lay: 'grid-2x2' as LayoutType },
              { id: 4, title: 'STYLE 4', desc: '4 Photos Classic (1x4)', count: 4, lay: 'strip-1x4' as LayoutType },
              { id: 5, title: 'STYLE 5', desc: '6 Photos Vertical', count: 6, lay: 'strip-1x4' as LayoutType },
              { id: 6, title: 'STYLE 6', desc: '9 Photos Collage', count: 9, lay: 'grid-2x2' as LayoutType },
            ].map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    setLayout(style.lay);
                  }}
                  className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center group ${
                    isSelected
                      ? 'border-black bg-white shadow-lg scale-102'
                      : 'border-black/20 bg-white/40 hover:border-black/50'
                  }`}
                >
                  <p className="font-editorial text-sm font-semibold tracking-wider text-black">
                    {style.title}
                  </p>

                  {/* Wireframe Mockup Visual */}
                  <div className="h-24 w-16 my-2 border border-black/30 rounded bg-[#FAF8F5] p-1.5 flex flex-col justify-between shadow-inner">
                    {style.id === 1 && (
                      <div className="aspect-square bg-amber-100/70 border border-black/20 rounded-sm" />
                    )}
                    {style.id === 2 && (
                      <div className="h-full flex flex-col gap-1">
                        <div className="flex-1 bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="flex-1 bg-amber-100/70 border border-black/20 rounded-sm" />
                      </div>
                    )}
                    {style.id === 3 && (
                      <div className="h-full grid grid-cols-2 gap-1">
                        <div className="bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="bg-amber-100/70 border border-black/20 rounded-sm" />
                      </div>
                    )}
                    {style.id === 4 && (
                      <div className="h-full flex flex-col gap-1">
                        <div className="flex-1 bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="flex-1 bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="flex-1 bg-amber-100/70 border border-black/20 rounded-sm" />
                        <div className="flex-1 bg-amber-100/70 border border-black/20 rounded-sm" />
                      </div>
                    )}
                    {style.id >= 5 && (
                      <div className="h-full grid grid-cols-2 gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="bg-amber-100/70 border border-black/20 rounded-sm" />
                        ))}
                      </div>
                    )}
                    <span className="font-script text-[9px] text-black/60 text-center -mt-0.5">poseclub</span>
                  </div>

                  <p className="text-[10px] font-mono text-black/60 uppercase">
                    {t.styles.find(s => s.id === style.id)?.desc || style.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Back & Next Button */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
            <button
              onClick={onBackToHome}
              className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black font-mono text-xs uppercase"
              title={t.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Brand signature */}
            <div className="flex items-center gap-2">
              <span className="font-script text-2xl text-black">poseclub</span>
              <span className="font-editorial text-xs tracking-widest text-black/60 uppercase">studio</span>
            </div>

            <button
              onClick={() => setStep('filter-select')}
              className="px-8 py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
            >
              <span>{t.next}</span>
              <span>✦</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- SUB-STEP 2: CHOOSE FILTER & FRAME (Slide 3 & 6) ----------------- */}
      {step === 'filter-select' && (
        <div className="h-full flex flex-col justify-between">
          <div className="text-center space-y-1">
            <h2 className="font-editorial text-2xl sm:text-4xl text-black font-medium tracking-[0.15em] uppercase">
              {t.step2Title}
            </h2>
            <p className="text-xs text-black/50 font-mono tracking-wider">
              {t.step2Subtitle}
            </p>
          </div>

          {/* Center Split: Controls on Left, Preview on Right */}
          <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Filter and Border buttons */}
            <div className="md:col-span-6 space-y-6">
              {/* Filter Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-black/60">
                  {t.filterLabel}
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'bw-contrast', label: 'B&W Contrast', desc: 'Đen trắng điện ảnh tương phản cao' },
                    { id: 'bw-film', label: 'B&W Film Grain', desc: 'Hạt phim hoài niệm cổ điển' },
                    { id: 'natural', label: 'Clean Natural', desc: 'Màu tự nhiên sáng trong trẻo' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as FilterType)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        filter === f.id
                          ? 'border-black bg-black text-white shadow-md'
                          : 'border-black/20 bg-white hover:border-black/60 text-black'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{t.filters.find(fl => fl.id === f.id)?.label || f.label}</p>
                        <p className={`text-[10px] ${filter === f.id ? 'text-white/70' : 'text-black/50'}`}>
                          {t.filters.find(fl => fl.id === f.id)?.desc || f.desc}
                        </p>
                      </div>
                      {filter === f.id && <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Color */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-black/60">
                  {t.frameColorLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFrameColor('black')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      frameColor === 'black'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-black/20 bg-white text-black'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-black border border-white" />
                    <span className="text-xs font-mono">{t.noirBlack}</span>
                  </button>
                  <button
                    onClick={() => setFrameColor('white')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      frameColor === 'white'
                        ? 'border-black bg-white text-black ring-2 ring-black shadow-md'
                        : 'border-black/20 bg-white text-black'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white border border-black" />
                    <span className="text-xs font-mono">{t.pureWhite}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Frame Preview */}
            <div className="md:col-span-6 flex justify-center">
              <div
                className={`w-52 p-4 rounded-xl border shadow-xl flex flex-col items-center justify-between transition-colors duration-300 ${
                  isDark
                    ? 'bg-[#0E0E0E] text-white border-black'
                    : 'bg-[#FAF9F6] text-black border-black/20'
                }`}
              >
                {/* 4 Dummy Shots Preview */}
                <div className="w-full space-y-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className="aspect-[4/3] rounded bg-stone-300 overflow-hidden relative border border-black/10 flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 opacity-40 text-black" />
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/50 text-white px-1 rounded">
                        0{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Watermark */}
                <div className="pt-3 text-center">
                  <p className="font-editorial text-xs font-bold tracking-widest uppercase">
                    poseclub studio
                  </p>
                  <p className="text-[8px] font-mono tracking-wider opacity-60">
                    FULLERTON, CA
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
            <button
              onClick={() => setStep('frame-select')}
              className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black"
              title={t.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShots([]);
                setCurrentShotIndex(0);
                setStep('camera');
              }}
              className="px-8 py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
            >
              <span>{t.startCapture}</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- SUB-STEP 3: TAKE YOUR PHOTOS (Slide 7) ----------------- */}
      {step === 'camera' && (
        <div className="h-full flex flex-col justify-between">
          <div className="text-center space-y-1">
            <h2 className="font-editorial text-2xl sm:text-4xl text-black font-medium tracking-[0.15em] uppercase">
              {t.step3Title}
            </h2>
            <p className="text-xs text-black/50 font-mono tracking-wider">
              {retakeIndex !== null
                ? `${t.step3SubtitleRetake} 0${retakeIndex + 1}`
                : `${t.step3SubtitleNormal} 0${currentShotIndex + 1}/04`}
            </p>
          </div>

          {/* Camera Viewport Center */}
          <div className="max-w-2xl w-full mx-auto my-auto relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-black bg-black shadow-2xl flex items-center justify-center">
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
                <div className="w-28 h-28 rounded-full border-4 border-white flex items-center justify-center animate-pulse">
                  <span className="font-editorial text-7xl text-white font-bold">{countdown}</span>
                </div>
              </div>
            )}

            {/* Camera Controls inside overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setIsMirror(!isMirror)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                title={t.mirrorTip}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCountdownDuration(countdownDuration === 3 ? 5 : 3)}
                className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-mono hover:bg-black transition-colors"
              >
                {countdownDuration}s
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

          {/* Bottom Bar: Action Trigger */}
          <div className="w-full max-w-2xl mx-auto flex items-center justify-between pt-2">
            <button
              onClick={() => setStep('filter-select')}
              disabled={isSessionActive}
              className="w-12 h-12 rounded-full border border-black/40 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-black disabled:opacity-40"
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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSessionActive}
              className="px-4 py-2.5 rounded-full border border-black/30 hover:border-black text-xs font-mono text-black transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.uploadBtn}</span>
            </button>

            {/* Big Shutter Trigger Button */}
            <button
              onClick={triggerCapture}
              disabled={isSessionActive || !cameraActive}
              className="px-8 py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-40"
            >
              <Camera className="w-4 h-4" />
              <span>{isSessionActive ? t.capturing : t.captureBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- SUB-STEP 4: CONFIRM & PRINT (Slide 8 & 9) ----------------- */}
      {step === 'confirm' && (
        <div className="h-full flex flex-col justify-between">
          <div className="text-center space-y-1">
            <h2 className="font-editorial text-2xl sm:text-4xl text-black font-medium tracking-[0.15em] uppercase">
              {t.step4Title}
            </h2>
            <p className="text-xs text-black/50 font-mono tracking-wider">
              {t.step4Subtitle}
            </p>
          </div>

          {/* Main Grid: Left Controls, Right Preview */}
          <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center overflow-hidden">
            
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
                  onClick={handlePrint}
                  className="w-full py-2.5 rounded-full border border-black/30 hover:border-black text-black hover:bg-black/5 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2"
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
                  <p className="font-editorial text-xs font-bold tracking-widest uppercase">
                    poseclub studio
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

    </div>
  );
};
