import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TRANSLATIONS, type Language } from '../../i18n/translations';
import type { FilterType, FrameTheme } from './types';
import { getThemesForStyle, type ThemeConfig } from './FrameThemes';
import { getFilterCss } from './color';
import { buildUploadedShots } from './upload';
import { shouldRestartCapture, isStripComplete } from './strip';
import { sounds } from './SoundEffects';
import {
  downloadCanvas,
  printCanvas,
  renderIndividualPhoto,
  downloadImagesAsZip,
  renderPhotostripToCanvas,
} from './CanvasExporter';

export type BoothStep = 'frame' | 'theme' | 'capture' | 'confirm';

export const BOOTH_STEP_PATH: Record<BoothStep, string> = {
  frame: '/photobooth/frame',
  theme: '/photobooth/theme',
  capture: '/photobooth/capture',
  confirm: '/photobooth/confirm',
};

interface BoothContextValue {
  language: Language;
  t: (typeof TRANSLATIONS)['en']['booth'];
  step: BoothStep;
  goTo: (step: BoothStep) => void;
  backToHome: () => void;

  selectedStyle: number | null;
  selectStyle: (id: number) => void;
  theme: FrameTheme;
  setTheme: (theme: FrameTheme) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  currentTheme: ThemeConfig;
  styleThemes: ThemeConfig[];
  totalShots: number;
  cameraRatio: string;

  customText: string;
  setCustomText: (text: string) => void;
  printCopies: number;
  setPrintCopies: (copies: number) => void;

  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  cameraActive: boolean;
  cameraError: string | null;
  facingMode: 'user' | 'environment';
  isMirror: boolean;
  setIsMirror: (mirror: boolean) => void;
  countdownDuration: 3 | 5;
  setCountdownDuration: (duration: 3 | 5) => void;
  countdown: number | null;
  isFlashing: boolean;
  toggleCameraFacing: () => void;
  startCamera: () => void;
  triggerCapture: () => void;

  shots: string[];
  currentShotIndex: number;
  retakeIndex: number | null;
  isSessionActive: boolean;
  startRetake: (idx: number) => void;
  goToRetake: (idx: number) => void;
  startNewStrip: () => void;

  uploadError: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
  downloadSuccess: boolean;
  singlesDownloaded: boolean;
  handleDownload: () => Promise<void>;
  handleDownloadSingles: () => Promise<void>;
  handlePrint: () => Promise<void>;

  renderCustomFrame: (widthClass: string) => React.ReactNode;
  getFilterStyle: () => React.CSSProperties;
}

const BoothContext = createContext<BoothContextValue | null>(null);

export const useBooth = (): BoothContextValue => {
  const context = useContext(BoothContext);
  if (!context) throw new Error('useBooth must be used inside BoothProvider');
  return context;
};

interface BoothProviderProps {
  language: Language;
  onBackToHome: () => void;
  children: React.ReactNode;
}

export const BoothProvider: React.FC<BoothProviderProps> = ({ language, onBackToHome, children }) => {
  const t = TRANSLATIONS[language].booth;
  const navigate = useNavigate();
  const location = useLocation();
  const step = (Object.keys(BOOTH_STEP_PATH) as BoothStep[])
    .find((candidate) => location.pathname === BOOTH_STEP_PATH[candidate]) ?? 'frame';

  const goTo = useCallback((next: BoothStep) => navigate(BOOTH_STEP_PATH[next]), [navigate]);

  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const activeStyle = selectedStyle !== null && getThemesForStyle(selectedStyle).length > 0 ? selectedStyle : 1;
  const styleThemes = getThemesForStyle(activeStyle);
  const [theme, setTheme] = useState<FrameTheme>(() => getThemesForStyle(1)[0].id);
  const currentTheme = styleThemes.find((item) => item.id === theme) ?? styleThemes[0];
  useEffect(() => {
    if (step !== 'frame' && selectedStyle === null) goTo('frame');
  }, [step, selectedStyle, goTo]);

  const [filter, setFilter] = useState<FilterType>('natural');
  const [customText, setCustomText] = useState<string>('');
  const [printCopies, setPrintCopies] = useState<number>(1);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirror, setIsMirror] = useState(true);
  const [countdownDuration, setCountdownDuration] = useState<3 | 5>(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [shots, setShots] = useState<string[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [singlesDownloaded, setSinglesDownloaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotIndexRef = useRef(0);
  const retakeRef = useRef<number | null>(null);
  const isMirrorRef = useRef(isMirror);
  isMirrorRef.current = isMirror;
  const facingModeRef = useRef(facingMode);
  const captureBusyRef = useRef(false);
  const exportingRef = useRef(false);
  const captureFnRef = useRef<() => void>(() => {});
  const sessionRef = useRef(false);
  const cameraGenerationRef = useRef(0);
  const countdownTimerRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const languageRef = useRef(language);
  languageRef.current = language;
  const updateMirror = useCallback((mirror: boolean) => {
    isMirrorRef.current = mirror;
    setIsMirror(mirror);
  }, []);

  const totalShots = currentTheme.slots?.length ?? 0;
  const cameraRatio = currentTheme.slots?.length
    ? `${currentTheme.slots[0].w} / ${currentTheme.slots[0].h}`
    : '4 / 3';

  const clearCaptureTimers = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((timer) => timer !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  const stopCamera = useCallback(() => {
    cameraGenerationRef.current += 1;
    clearCaptureTimers();
    captureBusyRef.current = false;
    sessionRef.current = false;
    setCountdown(null);
    setIsSessionActive(false);
    setIsFlashing(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, [clearCaptureTimers]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    const generation = ++cameraGenerationRef.current;
    let stream: MediaStream | null = null;
    let previous: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1440 }, facingMode: facingModeRef.current },
        audio: false,
      });
      if (generation !== cameraGenerationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      previous = streamRef.current;
      streamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (generation !== cameraGenerationRef.current) return;
          stopCamera();
          setCameraError(TRANSLATIONS[languageRef.current].booth.cameraError);
        });
      });
      previous?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      stream?.getTracks().forEach((track) => track.stop());
      previous?.getTracks().forEach((track) => track.stop());
      if (generation !== cameraGenerationRef.current) return;
      streamRef.current = null;
      console.error('Camera access error:', err);
      setCameraError(TRANSLATIONS[languageRef.current].booth.cameraError);
      setCameraActive(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (step === 'capture') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [step, startCamera, stopCamera]);

  const toggleCameraFacing = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    facingModeRef.current = next;
    setFacingMode(next);
    updateMirror(next === 'user');
    void startCamera();
  }, [facingMode, startCamera, updateMirror]);

  const snapFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    if (isMirrorRef.current) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, []);

  const finishShot = useCallback((photoData: string) => {
    const target = retakeRef.current ?? shotIndexRef.current;
    setShots((prev) => {
      const next = [...prev];
      next[target] = photoData;
      return next;
    });

    if (retakeRef.current !== null) {
      retakeRef.current = null;
      setRetakeIndex(null);
      sessionRef.current = false;
      setIsSessionActive(false);
      goTo('confirm');
      return;
    }

    const nextIndex = target + 1;
    if (nextIndex < totalShots) {
      shotIndexRef.current = nextIndex;
      setCurrentShotIndex(nextIndex);
      sessionRef.current = false;
      setIsSessionActive(false);
      scheduleTimeout(() => captureFnRef.current(), 1000);
    } else {
      sessionRef.current = false;
      setIsSessionActive(false);
      captureBusyRef.current = true;
      scheduleTimeout(() => {
        captureBusyRef.current = false;
        goTo('confirm');
      }, 600);
    }
  }, [goTo, totalShots, scheduleTimeout]);

  const startNewStrip = useCallback(() => {
    shotIndexRef.current = 0;
    retakeRef.current = null;
    captureBusyRef.current = false;
    sessionRef.current = false;
    setCurrentShotIndex(0);
    setRetakeIndex(null);
    setShots([]);
  }, []);

  const triggerCapture = useCallback(() => {
    if (captureBusyRef.current || sessionRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraActive(false);
      setCameraError(t.cameraError);
      return;
    }
    if (shouldRestartCapture(shots, totalShots, retakeRef.current)) startNewStrip();
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
      if (photoData) finishShot(photoData);
      else {
        sessionRef.current = false;
        setIsSessionActive(false);
        setCameraActive(false);
        setCameraError(t.cameraError);
      }
    }, 1000);
  }, [countdownDuration, snapFrame, finishShot, scheduleTimeout, shots, totalShots, startNewStrip, t]);

  captureFnRef.current = triggerCapture;

  const startRetake = useCallback((idx: number) => {
    retakeRef.current = idx;
    setRetakeIndex(idx);
    captureFnRef.current();
  }, []);

  const goToRetake = useCallback((idx: number) => {
    retakeRef.current = idx;
    setRetakeIndex(idx);
    goTo('capture');
  }, [goTo]);

  const selectStyle = useCallback((id: number) => {
    const themes = getThemesForStyle(id);
    if (themes.length === 0) return;
    startNewStrip();
    setSelectedStyle(id);
    setTheme(themes[0].id);
  }, [startNewStrip]);

  const getFilterStyle = useCallback(
    (): React.CSSProperties => ({ filter: getFilterCss(filter) }),
    [filter]
  );

  const renderCustomFrame = useCallback((widthClass: string): React.ReactNode => {
    const slots = currentTheme.slots ?? [];
    const fw = currentTheme.imageWidth ?? 1240;
    const fh = currentTheme.imageHeight ?? 1844;
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
          className={`relative z-10 block w-full h-auto ${shots.some(Boolean) ? 'pointer-events-none' : ''}`}
        />
      </div>
    );
  }, [currentTheme, shots, isSessionActive, startRetake, getFilterStyle]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length !== totalShots) {
      setUploadError(t.uploadCountError.replace('{count}', String(totalShots)));
      e.target.value = '';
      return;
    }
    if (files.some((file) => !file.type.startsWith('image/') || file.size > 20 * 1024 * 1024)) {
      setUploadError(t.uploadFailed);
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
      const uploaded = buildUploadedShots(dataUrls, totalShots);
      if (!uploaded) {
        setUploadError(t.uploadFailed);
        return;
      }
      shotIndexRef.current = 0;
      retakeRef.current = null;
      setRetakeIndex(null);
      setCurrentShotIndex(0);
      setShots(uploaded);
      goTo('confirm');
    } catch {
      setUploadError(t.uploadFailed);
    } finally {
      e.target.value = '';
    }
  }, [goTo, t, totalShots]);

  const handleDownload = useCallback(async () => {
    if (exportingRef.current) return;
    if (shots.length !== totalShots || !isStripComplete(shots, totalShots)) {
      setExportError(t.stripIncomplete);
      return;
    }
    exportingRef.current = true;
    setIsExporting(true);
    setExportError(null);
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        theme: currentTheme.id,
        filter,
        customFooterText: customText.trim(),
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      await downloadCanvas(canvas, `poseclub-photostrip-${timestamp}.png`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setExportError(t.exportError);
    } finally {
      exportingRef.current = false;
      setIsExporting(false);
    }
  }, [shots, totalShots, t, currentTheme.id, filter, customText]);

  const handleDownloadSingles = useCallback(async () => {
    if (exportingRef.current) return;
    if (shots.length !== totalShots || !isStripComplete(shots, totalShots)) {
      setExportError(t.stripIncomplete);
      return;
    }
    exportingRef.current = true;
    setIsExporting(true);
    setExportError(null);
    try {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const photos = await Promise.all(
        shots.map((shot, i) => renderIndividualPhoto(
          shot, i, filter,
          customText.trim() || 'poseclub studio',
          dateStr
        ))
      );
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      await downloadImagesAsZip(
        photos.map((canvas, i) => ({
          canvas,
          name: `poseclub-individual-${String(i + 1).padStart(2, '0')}.png`,
        })),
        `poseclub-individuals-${timestamp}.zip`
      );
      setSinglesDownloaded(true);
      setTimeout(() => setSinglesDownloaded(false), 2500);
    } catch (err) {
      console.error(err);
      setExportError(t.exportError);
    } finally {
      exportingRef.current = false;
      setIsExporting(false);
    }
  }, [shots, totalShots, t, filter, customText]);

  const handlePrint = useCallback(async () => {
    if (exportingRef.current) return;
    if (shots.length !== totalShots || !isStripComplete(shots, totalShots)) {
      setExportError(t.stripIncomplete);
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setExportError(t.printPopupBlocked);
      return;
    }
    exportingRef.current = true;
    setIsExporting(true);
    setExportError(null);
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        theme: currentTheme.id,
        filter,
        customFooterText: customText.trim(),
      });
      await printCanvas(canvas, printCopies, {
        printTitle: t.printDocumentTitle,
      }, printWindow);
    } catch (err) {
      printWindow.close();
      console.error(err);
      setExportError(t.exportError);
    } finally {
      exportingRef.current = false;
      setIsExporting(false);
    }
  }, [shots, totalShots, t, currentTheme.id, filter, customText, printCopies]);

  const value: BoothContextValue = {
    language, t, step, goTo, backToHome: onBackToHome,
    selectedStyle, selectStyle, theme, setTheme, filter, setFilter,
    currentTheme, styleThemes, totalShots, cameraRatio,
    customText, setCustomText, printCopies, setPrintCopies,
    videoRef, fileInputRef, cameraActive, cameraError, facingMode, isMirror, setIsMirror: updateMirror,
    countdownDuration, setCountdownDuration, countdown, isFlashing, toggleCameraFacing,
    startCamera, triggerCapture,
    shots, currentShotIndex, retakeIndex, isSessionActive, startRetake, goToRetake, startNewStrip,
    uploadError, handleFileUpload,
    isExporting, exportError, downloadSuccess, singlesDownloaded,
    handleDownload, handleDownloadSingles, handlePrint,
    renderCustomFrame, getFilterStyle,
  };

  return <BoothContext.Provider value={value}>{children}</BoothContext.Provider>;
};

