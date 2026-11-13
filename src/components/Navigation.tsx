import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { InstagramIcon } from './icons/InstagramIcon';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { STUDIO_CONFIG } from '../config/studio';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface NavigationProps {
  isMuted: boolean;
  onToggleMute: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isMuted,
  onToggleMute,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const location = useLocation();

  const tabs = [
    { path: '/', label: t.nav.home },
    { path: '/photobooth', label: t.nav.booth },
    { path: '/studio', label: t.nav.studio },
    { path: '/how-to-use', label: t.nav.guide },
  ];

  return (
    <header className="h-16 border-b border-black/10 bg-[#FAF8F5]/90 backdrop-blur-md px-6 flex items-center justify-between select-none z-50">
      {/* Brand Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 group text-left cursor-pointer"
      >
        <span className="text-[11px] font-mono tracking-widest text-black/60 uppercase">
          STUDIO
        </span>
        <span className="font-script text-3xl text-black -mb-1 group-hover:opacity-75 transition-opacity">
          Poseclub
        </span>
      </Link>

      {/* Tabs */}
      <nav className="flex items-center space-x-1 sm:space-x-2">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/' || location.pathname === '/home'
              : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              {isActive && <Sparkles className="w-2.5 h-2.5 text-white/90" />}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Language Switcher Pill */}
        <div className="flex items-center rounded-full border border-black/20 bg-white/70 p-0.5 shadow-sm text-xs font-mono">
          <button
            onClick={() => onToggleLanguage('vi')}
            className={`px-2.5 py-1 rounded-full transition-all ${
              language === 'vi'
                ? 'bg-black text-white font-bold'
                : 'text-black/60 hover:text-black'
            }`}
            title="Tiếng Việt"
          >
            VI
          </button>
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2.5 py-1 rounded-full transition-all ${
              language === 'en'
                ? 'bg-black text-white font-bold'
                : 'text-black/60 hover:text-black'
            }`}
            title="English"
          >
            EN
          </button>
        </div>
        <button
          onClick={onToggleMute}
          className="p-2 rounded-full border border-black/15 bg-white/60 hover:bg-white text-black transition-colors"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Instagram button */}
        <a
          href={STUDIO_CONFIG.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/15 bg-white/60 hover:bg-white text-xs font-medium text-black transition-colors"
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">@poseclub.photobooth</span>
        </a>
      </div>
    </header>
  );
};
