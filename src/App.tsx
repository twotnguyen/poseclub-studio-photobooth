import { useState } from 'react';
import { Navigation, TabId } from './components/Navigation';
import { Language } from './i18n/translations';
import { HomeTab } from './components/tabs/HomeTab';
import { BoothTab } from './components/tabs/BoothTab';
import { StudioTab } from './components/tabs/StudioTab';
import { GuideTab } from './components/tabs/GuideTab';
import { sounds } from './components/Photobooth/SoundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('poseclub_lang');
    return saved === 'en' || saved === 'vi' ? saved : 'vi';
  });

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('poseclub_lang', lang);
  };
  const toggleMute = () => {
    sounds.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-[#FAF8F5] text-black font-sans selection:bg-black selection:text-white">
      {/* Top Tab Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Tab Viewport (Zero Scroll, Fitted to screen) */}
      <main className="flex-1 w-full overflow-hidden relative">
        {activeTab === 'home' && (
          <HomeTab
            language={language}
            onStart={() => setActiveTab('booth')}
            onGoToStudio={() => setActiveTab('studio')}
          />
        )}
        {activeTab === 'booth' && (
          <BoothTab language={language} onBackToHome={() => setActiveTab('home')} />
        )}
        {activeTab === 'studio' && <StudioTab language={language} />}
        {activeTab === 'guide' && (
          <GuideTab language={language} onStartBooth={() => setActiveTab('booth')} />
        )}
      </main>
    </div>
  );
}
