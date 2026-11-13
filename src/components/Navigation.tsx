import React from 'react';
import { InstagramIcon } from './icons/InstagramIcon';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { STUDIO_CONFIG } from '../config/studio';

export type TabId = 'home' | 'booth' | 'studio' | 'guide';

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  onToggleMute,
}) => {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'booth', label: 'Photobooth' },
    { id: 'studio', label: 'Fullerton Studio' },
    { id: 'guide', label: 'How To Use' },
  ];

  return (
    <header className="h-16 border-b border-black/10 bg-[#FAF8F5]/90 backdrop-blur-md px-6 flex items-center justify-between select-none z-50">
      {/* Brand Logo */}
      <button
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 group text-left"
      >
        <span className="text-[11px] font-mono tracking-widest text-black/60 uppercase">
          STUDIO
        </span>
        <span className="font-script text-3xl text-black -mb-1 group-hover:opacity-75 transition-opacity">
          Poseclub
        </span>
      </button>

      {/* Tabs */}
      <nav className="flex items-center space-x-1 sm:space-x-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              {isActive && <Sparkles className="w-2.5 h-2.5 text-white/90" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Mute button */}
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
