import React from 'react';
import { ArrowUp } from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';
import { STUDIO_CONFIG } from '../config/studio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-12 text-studio-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
        
        {/* Top Tier */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white font-normal uppercase tracking-widest">
              {STUDIO_CONFIG.brandName}
            </h2>
            <p className="text-xs tracking-widestx2 uppercase text-studio-500 font-sans mt-1">
              Minimalist Photobooth &middot; Fullerton, CA
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest font-mono">
            <a href="#photobooth" className="hover:text-white transition-colors">
              Online Booth
            </a>
            <a href="#studio" className="hover:text-white transition-colors">
              Studio Location
            </a>
            <a
              href={STUDIO_CONFIG.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full border border-white/15 hover:border-white text-white transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Tier */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-light text-studio-500">
          <p>
            &copy; {new Date().getFullYear()} {STUDIO_CONFIG.brandName}. All rights reserved. 
            All images are processed locally on your device for absolute privacy.
          </p>
          <p className="font-mono text-[11px]">
            {STUDIO_CONFIG.address.street}, Fullerton, CA 92832
          </p>
        </div>

      </div>
    </footer>
  );
};
