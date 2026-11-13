import React, { useState } from 'react';
import { MapPin, Clock, Navigation, Check, Copy, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';
import { STUDIO_CONFIG } from '../config/studio';

export const StudioShowcase: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(STUDIO_CONFIG.address.full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="studio" className="py-24 border-t border-white/10 bg-studio-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.015] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-widest text-studio-300">
            <MapPin className="w-3.5 h-3.5 text-studio-300" />
            <span>Visit Our Studio</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-light text-white tracking-wide">
            The In-Person <span className="font-serif italic text-studio-200">Experience</span>
          </h2>
          <p className="text-studio-400 text-sm font-light leading-relaxed">
            Ngoài trải nghiệm trực tuyến, hãy ghé thăm phòng chụp photobooth thực tế của <span className="text-white font-medium">poseclub studio</span> tại Fullerton, California để sở hữu những dải ảnh in lấy liền chất lượng cao trên giấy in chuyên dụng.
          </p>
        </div>

        {/* 3 Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STUDIO_CONFIG.boothHighlights.map((highlight, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-studio-900/60 border border-white/10 hover:border-white/20 transition-all space-y-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-studio-300 group-hover:bg-white group-hover:text-black transition-colors">
                0{index + 1}
              </div>
              <h3 className="font-editorial text-xl text-white font-normal">
                {highlight.title}
              </h3>
              <p className="text-xs text-studio-400 font-light leading-relaxed">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Location & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-studio-900/80 border border-white/10 rounded-2xl p-7 sm:p-9 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-5">
                <span className="text-[10px] tracking-widestx2 uppercase text-studio-400 font-mono">Location</span>
                <h3 className="font-editorial text-2xl text-white mt-1">Fullerton Studio</h3>
                <p className="text-sm text-studio-300 font-light mt-2 leading-relaxed">
                  {STUDIO_CONFIG.address.street}<br />
                  {STUDIO_CONFIG.address.cityStateZip}<br />
                  {STUDIO_CONFIG.address.country}
                </p>

                {/* Copy Address Button */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-studio-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã sao chép địa chỉ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-studio-400" />
                        <span>Sao chép địa chỉ</span>
                      </>
                    )}
                  </button>

                  <a
                    href={STUDIO_CONFIG.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-studio-200 text-xs font-medium transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Mở Google Maps</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-studio-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hours of Operation</span>
                </div>
                <div className="space-y-2 pt-1">
                  {STUDIO_CONFIG.hours.map((h, i) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                      <span className="text-studio-300">{h.days}</span>
                      <span className="font-mono text-white">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instagram Connect Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-white/20 flex items-center justify-center">
                    <InstagramIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white tracking-wide">Instagram</p>
                    <p className="text-[11px] text-studio-400">{STUDIO_CONFIG.instagram.handle}</p>
                  </div>
                </div>
                <a
                  href={STUDIO_CONFIG.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-full hover:bg-studio-200 transition-colors flex items-center gap-1"
                >
                  <span>Follow</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-studio-400 font-light leading-relaxed">
                Theo dõi trang Instagram để cập nhật các mẫu frame mới theo mùa, sự kiện đặc biệt và thông tin check-in tại Fullerton studio.
              </p>
            </div>
          </div>

          {/* Right Map Preview & Gallery Visual */}
          <div className="lg:col-span-7 bg-studio-900/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Map Header */}
            <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-studio-950/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs uppercase tracking-widest text-studio-300 font-mono">
                  Fullerton, California &bull; Open Today
                </span>
              </div>
              <a
                href={STUDIO_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-studio-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Chỉ đường</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Google Maps Iframe */}
            <div className="relative w-full h-[320px] sm:h-[380px] bg-studio-950">
              <iframe
                title="Poseclub Studio Fullerton Location"
                src="https://maps.google.com/maps?q=1327%20S%20Harbor%20Blvd,%20Fullerton,%20CA%2092832&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.9) contrast(1.2) invert(0.92)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Bottom Studio Vibe Gallery Footer */}
            <div className="p-6 bg-studio-950/70 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-white tracking-wide">
                  Có sẵn buồng chụp & phụ kiện thời trang
                </p>
                <p className="text-[11px] text-studio-400 mt-0.5">
                  Ghẹ trực tiếp bất kỳ lúc nào trong khung giờ hoạt động hoặc nhắn qua Instagram.
                </p>
              </div>
              <a
                href={STUDIO_CONFIG.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-xs uppercase tracking-widest text-white transition-colors whitespace-nowrap"
              >
                Nhắn tin Instagram
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
