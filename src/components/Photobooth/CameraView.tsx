import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Volume2, VolumeX, Upload, AlertCircle } from 'lucide-react';
import { sounds } from './SoundEffects';

interface CameraViewProps {
  onCaptureComplete: (shots: string[]) => void;
  onSingleShotRetake?: (shot: string) => void;
  retakeIndex: number | null;
  initialShots: string[];
  isMuted: boolean;
  onToggleMute: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCaptureComplete,
  onSingleShotRetake,
  retakeIndex,
  initialShots,
  isMuted,
  onToggleMute,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [countdownDuration, setCountdownDuration] = useState<3 | 5>(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Shots accumulated in this session
  const [capturedShots, setCapturedShots] = useState<string[]>(initialShots);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(
    retakeIndex !== null ? retakeIndex : 0
  );
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Start webcam
  const startCamera = useCallback(async () => {
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
      setCameraError(
        'Không thể mở webcam (vui lòng cấp quyền truy cập camera trong cài đặt trình duyệt hoặc sử dụng tính năng tải ảnh từ máy).'
      );
      setCameraActive(false);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture single frame from video to data URL
  const snapFrame = useCallback((): string | null => {
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

  // Run countdown & capture loop
  const triggerCapture = useCallback(() => {
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

        // Flash and shutter
        setIsFlashing(true);
        sounds.playShutterSound();
        setTimeout(() => setIsFlashing(false), 220);

        const photoData = snapFrame();
        if (photoData) {
          if (retakeIndex !== null) {
            // Single shot retake mode
            onSingleShotRetake?.(photoData);
            setIsSessionActive(false);
          } else {
            // Normal 4-shot sequence
            setCapturedShots((prev) => {
              const next = [...prev];
              next[currentShotIndex] = photoData;

              if (currentShotIndex < 3) {
                setCurrentShotIndex(currentShotIndex + 1);
                // Pause 1s then start next countdown
                setTimeout(() => {
                  triggerCapture();
                }, 1000);
              } else {
                // Completed all 4 shots
                setIsSessionActive(false);
                setTimeout(() => {
                  onCaptureComplete(next);
                }, 600);
              }
              return next;
            });
          }
        }
      }
    }, 1000);
  }, [
    countdownDuration,
    snapFrame,
    retakeIndex,
    currentShotIndex,
    onSingleShotRetake,
    onCaptureComplete,
  ]);

  // Handle uploading photos from device
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
            // Fill up to 4 if fewer than 4 uploaded
            const finalShots = [...loadedUrls];
            while (finalShots.length < 4) {
              finalShots.push(finalShots[0]);
            }
            onCaptureComplete(finalShots);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-studio-900 border border-white/10 shadow-2xl overflow-hidden">
      {/* Top Booth Control Bar */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-studio-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-editorial text-lg text-white font-medium uppercase tracking-widest">
            {retakeIndex !== null
              ? `Chụp lại tấm 0${retakeIndex + 1}`
              : `Buồng chụp poseclub • Shot 0${currentShotIndex + 1}/04`}
          </span>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Countdown duration toggle */}
          <button
            onClick={() => setCountdownDuration(countdownDuration === 3 ? 5 : 3)}
            disabled={isSessionActive}
            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-studio-200 transition-colors disabled:opacity-40"
            title="Đổi thời gian đếm ngược"
          >
            {countdownDuration}s
          </button>

          {/* Mirror toggle */}
          <button
            onClick={() => setIsMirror(!isMirror)}
            disabled={isSessionActive}
            className={`p-2 rounded-lg border transition-colors ${
              isMirror
                ? 'border-white/40 bg-white/15 text-white'
                : 'border-white/15 bg-white/5 text-studio-400'
            }`}
            title="Lật gương camera (Mirror Mode)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-studio-200 transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
        {/* Live Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirror ? '-scale-x-100' : 'scale-x-100'
          } ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Shutter Flash Animation Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-flash" />
        )}

        {/* Countdown Large Visual */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
            <div className="w-36 h-36 rounded-full border-4 border-white/60 flex items-center justify-center animate-pulse bg-black/40">
              <span className="font-editorial text-8xl text-white font-bold">{countdown}</span>
            </div>
          </div>
        )}

        {/* Camera Error / Not active banner */}
        {!cameraActive && cameraError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-studio-950/90 space-y-4">
            <AlertCircle className="w-12 h-12 text-studio-400" />
            <div className="max-w-md space-y-2">
              <h3 className="font-editorial text-2xl text-white">Chưa mở được camera</h3>
              <p className="text-xs text-studio-400 leading-relaxed">{cameraError}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-studio-200 transition-colors"
              >
                Thử lại camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-full border border-white/20 text-white text-xs font-medium uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh từ máy</span>
              </button>
            </div>
          </div>
        )}

        {/* Subtle crosshair guide overlay */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 m-6 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="p-6 bg-studio-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
        
        {/* Progress Dots for 4 shots */}
        <div className="flex items-center gap-2.5">
          {[0, 1, 2, 3].map((idx) => {
            const hasShot = !!capturedShots[idx];
            const isCurrent = idx === currentShotIndex;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all flex items-center justify-center text-[9px] font-mono ${
                  hasShot
                    ? 'bg-white text-black font-bold'
                    : isCurrent
                    ? 'border-2 border-white bg-white/20 text-white'
                    : 'border border-white/20 text-studio-500'
                }`}
              >
                {idx + 1}
              </div>
            );
          })}
          <span className="text-xs text-studio-400 font-mono ml-2">
            {retakeIndex !== null ? 'Chế độ chụp lại 1 tấm' : '4 kiểu ảnh liền mạch'}
          </span>
        </div>

        {/* Main Action Trigger */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          {/* Upload fallback button */}
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
            className="px-4 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-studio-300 text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải ảnh</span>
          </button>

          {/* Big Shutter Button */}
          <button
            onClick={triggerCapture}
            disabled={isSessionActive || !cameraActive}
            className="flex-1 sm:flex-initial px-8 py-3.5 rounded-full bg-white text-black hover:bg-studio-200 text-xs uppercase tracking-widest font-bold transition-all shadow-xl hover:shadow-white/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <Camera className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>
              {isSessionActive
                ? 'Đang đếm ngược...'
                : retakeIndex !== null
                ? 'Chụp lại tấm này'
                : 'Bấm để chụp'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
