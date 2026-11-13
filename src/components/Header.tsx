import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Menu, X, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';
import { STUDIO_CONFIG } from '../config/studio';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-studio-950/85 backdrop-blur-md border-b border-white/10 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <a href="#" className="flex flex-col group">
          <span className="font-editorial text-2xl sm:text-3xl tracking-widest font-normal text-white group-hover:text-studio-300 transition-colors uppercase">
            {STUDIO_CONFIG.brandName}
          </span>
          <span className="text-[10px] tracking-widestx2 text-studio-400 uppercase font-sans -mt-0.5">
            Photobooth & Studio
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs tracking-widest uppercase font-medium">
          <a
            href="#photobooth"
            className="text-studio-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Online Booth</span>
          </a>
          <a
            href="#studio"
            className="text-studio-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Fullerton Studio</span>
          </a>
          <a
            href={STUDIO_CONFIG.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-studio-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>{STUDIO_CONFIG.instagram.handle}</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center space-x-4">
          <a
            href="#photobooth"
            className="px-4 py-2 text-xs uppercase tracking-widest font-medium bg-white text-black hover:bg-studio-200 transition-all rounded-full flex items-center gap-2 group shadow-sm"
          >
            <span>Chụp ảnh ngay</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-studio-950 border-b border-white/10 px-6 py-6 space-y-4">
          <a
            href="#photobooth"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-widest uppercase text-studio-200 hover:text-white"
          >
            Online Photobooth
          </a>
          <a
            href="#studio"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-widest uppercase text-studio-200 hover:text-white"
          >
            Fullerton Studio Location
          </a>
          <a
            href={STUDIO_CONFIG.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm tracking-widest uppercase text-studio-200 hover:text-white"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>{STUDIO_CONFIG.instagram.handle}</span>
          </a>
          <a
            href="#photobooth"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold rounded-full mt-4"
          >
            Chụp ảnh miễn phí
          </a>
        </div>
      )}
    </header>
  );
};
