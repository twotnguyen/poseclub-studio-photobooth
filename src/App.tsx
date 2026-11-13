import { useState } from 'react';
import { Navigation, TabId } from './components/Navigation';
import { HomeTab } from './components/tabs/HomeTab';
import { BoothTab } from './components/tabs/BoothTab';
import { StudioTab } from './components/tabs/StudioTab';
import { GuideTab } from './components/tabs/GuideTab';
import { sounds } from './components/Photobooth/SoundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isMuted, setIsMuted] = useState<boolean>(false);

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
      />

      {/* Main Tab Viewport (Zero Scroll, Fitted to screen) */}
      <main className="flex-1 w-full overflow-hidden relative">
        {activeTab === 'home' && (
          <HomeTab
            onStart={() => setActiveTab('booth')}
            onGoToStudio={() => setActiveTab('studio')}
          />
        )}
        {activeTab === 'booth' && (
          <BoothTab onBackToHome={() => setActiveTab('home')} />
        )}
        {activeTab === 'studio' && <StudioTab />}
        {activeTab === 'guide' && (
          <GuideTab onStartBooth={() => setActiveTab('booth')} />
        )}
      </main>
    </div>
  );
}
