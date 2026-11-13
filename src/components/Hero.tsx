import React from 'react';
import { Camera, MapPin, Sparkles, ArrowDown } from 'lucide-react';
import { STUDIO_CONFIG } from '../config/studio';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-white/5">
      {/* Background ambient subtle grain & vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.035),transparent_65%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[11px] uppercase tracking-widest text-studio-300">
              <Sparkles className="w-3 h-3 text-studio-200" />
              <span>Free Online Vintage Photobooth</span>
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <span className="text-white font-medium">300 DPI High-Res</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-light tracking-wide text-white leading-[1.05]">
                Capturing moments in <span className="font-serif italic font-normal text-studio-200">timeless</span> monochrome.
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-widestx2 text-studio-400 font-sans pt-2">
                {STUDIO_CONFIG.brandName} &mdash; Fullerton, California
              </p>
            </div>

            {/* Description */}
            <p className="text-studio-300 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Trải nghiệm buồng chụp photobooth cổ điển trực tiếp trên trình duyệt của bạn hoàn toàn miễn phí. 
              Tạo dải ảnh phong cách tối giản đen trắng, tải về độ phân giải cao và ghé thăm không gian studio thực tế của chúng tôi tại Fullerton.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#photobooth"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-studio-200 text-xs uppercase tracking-widest font-semibold rounded-full transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-white/10"
              >
                <Camera className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Bắt đầu chụp ngay</span>
              </a>
              <a
                href="#studio"
                className="w-full sm:w-auto px-7 py-3.5 bg-transparent border border-white/20 hover:border-white/50 text-white text-xs uppercase tracking-widest font-medium rounded-full transition-all flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-studio-400" />
                <span>Ghé thăm Studio</span>
              </a>
            </div>

            {/* Features micro-badges */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-white/10 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="text-white text-xs font-semibold tracking-wider">01. Miễn phí</p>
                <p className="text-[11px] text-studio-400 mt-0.5">Không cần cài app</p>
              </div>
              <div>
                <p className="text-white text-xs font-semibold tracking-wider">02. Riêng tư</p>
                <p className="text-[11px] text-studio-400 mt-0.5">Xử lý 100% trên máy</p>
              </div>
              <div>
                <p className="text-white text-xs font-semibold tracking-wider">03. Chuẩn in</p>
                <p className="text-[11px] text-studio-400 mt-0.5">Dải ảnh 2x6" sắc nét</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Teaser Mockup of Photo Strip */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative group">
              {/* Outer decorative card */}
              <div className="relative w-64 sm:w-72 bg-studio-900 border border-white/15 p-4 rounded-xl shadow-2xl transition-transform duration-500 group-hover:-translate-y-1">
                {/* Vintage Photo Strip Preview */}
                <div className="bg-[#111111] p-3 rounded-md shadow-inner border border-white/10 space-y-2.5">
                  {/* Photo 1 */}
                  <div className="aspect-[4/3] bg-studio-800 rounded overflow-hidden relative border border-white/5">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                      alt="Sample 1"
                      className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/70 bg-black/60 px-1 py-0.5 rounded">01</span>
                  </div>
                  {/* Photo 2 */}
                  <div className="aspect-[4/3] bg-studio-800 rounded overflow-hidden relative border border-white/5">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                      alt="Sample 2"
                      className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/70 bg-black/60 px-1 py-0.5 rounded">02</span>
                  </div>
                  {/* Photo 3 */}
                  <div className="aspect-[4/3] bg-studio-800 rounded overflow-hidden relative border border-white/5">
                    <img
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80"
                      alt="Sample 3"
                      className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/70 bg-black/60 px-1 py-0.5 rounded">03</span>
                  </div>

                  {/* Strip Bottom Branding (Flow Frame Style) */}
                  <div className="pt-2 text-center border-t border-white/10">
                    <p className="font-editorial text-xs tracking-widest uppercase text-white font-medium">
                      {STUDIO_CONFIG.brandName}
                    </p>
                    <p className="text-[9px] tracking-widest text-studio-400 uppercase font-sans mt-0.5">
                      Fullerton, CA &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Floating Tag */}
                <div className="absolute -bottom-3 -right-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-lg border border-black/10">
                  Signature 1x4 Strip
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Scroll down indicator */}
        <div className="pt-16 flex justify-center">
          <a
            href="#photobooth"
            className="flex flex-col items-center gap-1.5 text-studio-400 hover:text-white transition-colors group"
          >
            <span className="text-[10px] tracking-widest uppercase font-mono">Cuộn xuống để chụp</span>
            <ArrowDown className="w-4 h-4 animate-bounce text-studio-300 group-hover:text-white" />
          </a>
        </div>
      </div>
    </section>
  );
};
