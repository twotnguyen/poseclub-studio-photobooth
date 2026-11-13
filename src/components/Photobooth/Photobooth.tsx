import React, { useState } from 'react';
import { CameraView } from './CameraView';
import { ReviewView } from './ReviewView';
import { FilterType, FrameColor, LayoutType } from './types';
import { STUDIO_CONFIG } from '../../config/studio';
import { sounds } from './SoundEffects';

export const Photobooth: React.FC = () => {
  const [step, setStep] = useState<'camera' | 'review'>('camera');
  const [shots, setShots] = useState<string[]>([]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Frame & Filter States
  const [filter, setFilter] = useState<FilterType>('bw-contrast');
  const [layout, setLayout] = useState<LayoutType>('strip-1x4');
  const [frameColor, setFrameColor] = useState<FrameColor>('black');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const toggleMute = () => {
    sounds.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleCaptureComplete = (capturedShots: string[]) => {
    setShots(capturedShots);
    setRetakeIndex(null);
    setStep('review');
  };

  const handleSingleShotRetake = (newShot: string) => {
    if (retakeIndex !== null) {
      setShots((prev) => {
        const next = [...prev];
        next[retakeIndex] = newShot;
        return next;
      });
      setRetakeIndex(null);
      setStep('review');
    }
  };

  const startRetakeSingle = (index: number) => {
    setRetakeIndex(index);
    setStep('camera');
  };

  const handleRetakeAll = () => {
    setShots([]);
    setRetakeIndex(null);
    setStep('camera');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section id="photobooth" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-widest text-studio-300">
            <span>Online Studio Engine</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white tracking-wide">
            {step === 'camera' ? (
              retakeIndex !== null ? (
                <>Retake Shot <span className="font-serif italic text-studio-200">0{retakeIndex + 1}</span></>
              ) : (
                <>Take Your <span className="font-serif italic text-studio-200">Photostrip</span></>
              )
            ) : (
              <>Your Poseclub <span className="font-serif italic text-studio-200">Memory</span></>
            )}
          </h2>
          <p className="text-studio-400 text-xs sm:text-sm font-light">
            {step === 'camera'
              ? 'Tạo dáng trước camera. Hệ thống sẽ đếm ngược và chụp liên tiếp 4 khoảnh khắc tự nhiên nhất của bạn.'
              : 'Dải ảnh đã hoàn thành. Hãy chọn phong cách bộ lọc, đổi màu khung hoặc tải về ảnh độ phân giải cao.'}
          </p>
        </div>

        {/* Photobooth Active Screen */}
        <div className="pt-2">
          {step === 'camera' ? (
            <CameraView
              onCaptureComplete={handleCaptureComplete}
              onSingleShotRetake={handleSingleShotRetake}
              retakeIndex={retakeIndex}
              initialShots={shots}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />
          ) : (
            <ReviewView
              shots={shots}
              filter={filter}
              setFilter={setFilter}
              layout={layout}
              setLayout={setLayout}
              frameColor={frameColor}
              setFrameColor={setFrameColor}
              onRetakeSingle={startRetakeSingle}
              onRetakeAll={handleRetakeAll}
              brandName={STUDIO_CONFIG.brandName}
              location="Fullerton, CA"
              dateStr={formattedDate}
            />
          )}
        </div>

      </div>
    </section>
  );
};
