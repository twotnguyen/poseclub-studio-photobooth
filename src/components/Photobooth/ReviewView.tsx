import React, { useState } from 'react';
import { Download, Printer, RotateCcw, Camera, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { FilterType, FrameColor, LayoutType } from './types';
import { renderPhotostripToCanvas, downloadCanvas, printCanvas } from './CanvasExporter';

interface ReviewViewProps {
  shots: string[];
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  layout: LayoutType;
  setLayout: (l: LayoutType) => void;
  frameColor: FrameColor;
  setFrameColor: (c: FrameColor) => void;
  onRetakeSingle: (index: number) => void;
  onRetakeAll: () => void;
  brandName: string;
  location: string;
  dateStr: string;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  shots,
  filter,
  setFilter,
  layout,
  setLayout,
  frameColor,
  setFrameColor,
  onRetakeSingle,
  onRetakeAll,
  brandName,
  location,
  dateStr,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // CSS filter string for live preview
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

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderPhotostripToCanvas({
        images: shots,
        layout,
        frameColor,
        filter,
        brandName,
        location,
        dateStr,
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadCanvas(canvas, `poseclub-photostrip-${timestamp}.png`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export canvas:', err);
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
        brandName,
        location,
        dateStr,
      });
      printCanvas(canvas);
    } catch (err) {
      console.error('Failed to print canvas:', err);
    }
  };

  const isDarkFrame = frameColor === 'black';

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      {/* Left Column: Live Photostrip Preview */}
      <div className="lg:col-span-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-md">
          
          {/* Outer photostrip wrapper */}
          <div
            className={`w-full rounded-2xl p-5 sm:p-7 shadow-2xl transition-all duration-300 border ${
              isDarkFrame
                ? 'bg-[#0C0C0C] text-white border-white/15'
                : 'bg-[#FAF9F6] text-black border-black/10'
            }`}
          >
            {/* Photos container depending on layout */}
            {layout === 'strip-1x4' ? (
              <div className="space-y-4">
                {shots.map((shot, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded overflow-hidden border border-black/10 bg-studio-800 shadow-sm group"
                  >
                    <img
                      src={shot}
                      alt={`Shot ${idx + 1}`}
                      style={getFilterStyle()}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white/80">
                      0{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {shots.map((shot, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded overflow-hidden border border-black/10 bg-studio-800 shadow-sm group"
                  >
                    <img
                      src={shot}
                      alt={`Shot ${idx + 1}`}
                      style={getFilterStyle()}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white/80">
                      0{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Branding (Flow Frame Signature) */}
            <div className="pt-6 pb-2 text-center space-y-1.5">
              <h3 className="font-editorial text-2xl sm:text-3xl tracking-widest uppercase font-medium">
                {brandName}
              </h3>
              <div className="w-16 h-[1px] mx-auto bg-current opacity-25" />
              <p className="text-[10px] tracking-widest font-mono uppercase opacity-75">
                {location} &bull; {dateStr}
              </p>
              <p className="text-[8px] tracking-widestx2 uppercase font-mono opacity-40 pt-1">
                ORIGINAL PHOTOSTRIP ARCHIVE
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-studio-400 font-mono mt-3">
            Preview trực tiếp &bull; Xuất file định dạng 300 DPI sắc nét
          </p>
        </div>
      </div>

      {/* Right Column: Customization Controls & Actions */}
      <div className="lg:col-span-6 space-y-8 bg-studio-900/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-widest text-studio-300">
            <Sparkles className="w-3 h-3 text-studio-200" />
            <span>Customize Your Frame</span>
          </div>
          <h2 className="font-editorial text-3xl text-white font-normal mt-2">
            Hoàn thiện dải ảnh
          </h2>
          <p className="text-xs text-studio-400 font-light mt-1">
            Chọn bộ lọc đen trắng, layout khung và màu viền trước khi tải về hoặc in.
          </p>
        </div>

        {/* 1. Filter Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-widest text-studio-400">
            01. Bộ lọc hình ảnh (Filters)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'bw-contrast', name: 'B&W Contrast', desc: 'Đen trắng điện ảnh' },
              { id: 'bw-film', name: 'B&W Film Grain', desc: 'Hạt film hoài niệm' },
              { id: 'natural', name: 'Clean Natural', desc: 'Màu sắc trong trẻo' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as FilterType)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filter === f.id
                    ? 'border-white bg-white/15 text-white shadow-md'
                    : 'border-white/10 bg-white/5 text-studio-400 hover:border-white/20'
                }`}
              >
                <p className="text-xs font-medium text-white">{f.name}</p>
                <p className="text-[10px] text-studio-400 mt-0.5">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Layout & Frame Color Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Layout */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase tracking-widest text-studio-400">
              02. Kiểu khung (Layout)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLayout('strip-1x4')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  layout === 'strip-1x4'
                    ? 'border-white bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-studio-400 hover:border-white/20'
                }`}
              >
                <p className="text-xs font-medium text-white">Strip 1x4</p>
                <p className="text-[10px] text-studio-400 mt-0.5">Dải dọc 2x6"</p>
              </button>
              <button
                onClick={() => setLayout('grid-2x2')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  layout === 'grid-2x2'
                    ? 'border-white bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-studio-400 hover:border-white/20'
                }`}
              >
                <p className="text-xs font-medium text-white">Grid 2x2</p>
                <p className="text-[10px] text-studio-400 mt-0.5">Khung 4x6"</p>
              </button>
            </div>
          </div>

          {/* Frame Color */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase tracking-widest text-studio-400">
              03. Màu viền (Border)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFrameColor('black')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  frameColor === 'black'
                    ? 'border-white bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-studio-400 hover:border-white/20'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/40 mx-auto mb-1" />
                <p className="text-xs font-medium text-white">Noir Black</p>
              </button>
              <button
                onClick={() => setFrameColor('white')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  frameColor === 'white'
                    ? 'border-white bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-studio-400 hover:border-white/20'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-black/40 mx-auto mb-1" />
                <p className="text-xs font-medium text-white">Pure White</p>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Retake individual shot thumbnails */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-widest text-studio-400">
              04. Chụp lại từng tấm (Single Retake)
            </label>
            <span className="text-[11px] text-studio-400">Bấm tấm bất kỳ để chụp lại</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {shots.map((shot, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/15 bg-black"
              >
                <img
                  src={shot}
                  alt={`Thumbnail ${idx + 1}`}
                  style={getFilterStyle()}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  onClick={() => onRetakeSingle(idx)}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white"
                  title={`Chụp lại tấm 0${idx + 1}`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Chụp lại</span>
                </button>
                <span className="absolute top-1 left-1.5 text-[8px] font-mono bg-black/60 px-1 rounded text-white/80">
                  0{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-4 rounded-full bg-white text-black hover:bg-studio-200 text-xs uppercase tracking-widest font-bold transition-all shadow-xl hover:shadow-white/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã tải dải ảnh!</span>
                </>
              ) : isExporting ? (
                <>
                  <ImageIcon className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý ảnh 300 DPI...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>Tải ảnh High-Res (PNG)</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="w-full py-4 rounded-full border border-white/25 hover:border-white text-white text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 hover:bg-white/5"
            >
              <Printer className="w-4 h-4" />
              <span>In trực tiếp (Print)</span>
            </button>
          </div>

          {/* Retake All Button */}
          <button
            onClick={onRetakeAll}
            className="w-full py-3 text-center text-xs uppercase tracking-widest text-studio-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chụp lại toàn bộ 4 tấm từ đầu</span>
          </button>
        </div>

      </div>

    </div>
  );
};
