import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { InstagramIcon } from './icons/InstagramIcon';
import { Volume2, VolumeX, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    drawerRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const rawPath = location.pathname;
  const canonicalPath =
    rawPath === '/home'
      ? '/'
      : rawPath.startsWith('/booth')
        ? `/photobooth${rawPath.slice('/booth'.length)}`
        : rawPath === '/guide'
          ? '/how-to-use'
          : rawPath;

  const tabs = [
    { path: '/', label: t.nav.home },
    { path: '/photobooth', label: t.nav.booth },
    { path: '/studio', label: t.nav.studio },
    { path: '/how-to-use', label: t.nav.guide },
  ];

  return (
    <>
      <header className="h-16 border-b border-black/10 bg-[#FAF8F5]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none z-50 sticky top-0">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-1.5 sm:gap-2 group text-left cursor-pointer"
        >
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-black/60 uppercase">
            STUDIO
          </span>
          <span className="font-script text-2xl sm:text-3xl text-black -mb-1 group-hover:opacity-75 transition-opacity">
            Poseclub
          </span>
        </Link>

        {/* Desktop Tabs (hidden on mobile, visible on md+) */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const isActive =
              tab.path === '/'
                ? canonicalPath === '/'
                : canonicalPath === tab.path || canonicalPath.startsWith(`${tab.path}/`);
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
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Language Switcher Pill */}
          <div className="flex items-center rounded-full border border-black/20 bg-white/70 p-0.5 shadow-sm text-xs font-mono">
            <button
              onClick={() => onToggleLanguage('vi')}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all text-[11px] sm:text-xs ${
                language === 'vi'
                  ? 'bg-black text-white font-bold'
                  : 'text-black/60 hover:text-black'
              }`}
              aria-label={t.nav.languageVi}
              title={t.nav.languageVi}
            >
              VI
            </button>
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all text-[11px] sm:text-xs ${
                language === 'en'
                  ? 'bg-black text-white font-bold'
                  : 'text-black/60 hover:text-black'
              }`}
              aria-label={t.nav.languageEn}
              title={t.nav.languageEn}
            >
              EN
            </button>
          </div>

          {/* Sound Toggle Button (Desktop & Mobile) */}
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-full border border-black/20 bg-white/70 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-black/70 shadow-sm cursor-pointer"
            aria-label={isMuted ? t.nav.unmute : t.nav.mute}
            title={isMuted ? t.nav.unmute : t.nav.mute}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Instagram Button (Desktop only) */}
          <a
            href={STUDIO_CONFIG.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.nav.instagram} ${STUDIO_CONFIG.instagram.handle}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/20 bg-white/60 hover:bg-white text-xs font-mono text-black transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">{STUDIO_CONFIG.instagram.handle}</span>
          </a>

          {/* Mobile Menu Hamburger Button (visible on mobile only) */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full border border-black/20 bg-white/70 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-black shadow-sm cursor-pointer ml-1"
            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer Modal */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex flex-col justify-start pt-16">
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menuLabel}
            tabIndex={-1}
            className="bg-[#FAF8F5] border-b border-black/15 shadow-2xl p-6 space-y-4 outline-none"
          >
            <nav className="flex flex-col space-y-2">
              {tabs.map((tab) => {
                const isActive =
                  tab.path === '/'
                    ? canonicalPath === '/'
                    : canonicalPath === tab.path || canonicalPath.startsWith(`${tab.path}/`);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-xl text-sm font-medium tracking-wider uppercase transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-black text-white font-semibold shadow-sm'
                        : 'text-black/80 hover:bg-black/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isActive && <Sparkles className="w-3.5 h-3.5 text-white/90" />}
                      <span>{tab.label}</span>
                    </div>
                    <span className="text-xs opacity-50 font-mono">→</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-black/10 flex items-center justify-between">
              <a
                href={STUDIO_CONFIG.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                aria-label={`${t.nav.instagram} ${STUDIO_CONFIG.instagram.handle}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-black hover:opacity-80 transition-opacity"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>{STUDIO_CONFIG.instagram.handle}</span>
                <ArrowUpRight className="w-3 h-3 opacity-50" />
              </a>

              <span className="text-[10px] font-mono text-black/40 uppercase">Fullerton, CA</span>
            </div>
          </div>

          {/* Clickable backdrop area to close menu */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={t.nav.closeMenu}
            onClick={closeMobileMenu}
            className="flex-1 w-full cursor-default"
          />
        </div>
      )}
    </>
  );
};
