import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Language } from './i18n/translations';
import { HomeTab } from './components/tabs/HomeTab';
import { BoothTab } from './components/tabs/BoothTab';
import { StudioTab } from './components/tabs/StudioTab';
import { GuideTab } from './components/tabs/GuideTab';
import { sounds } from './components/Photobooth/SoundEffects';
export default function App() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('poseclub_lang');
    return saved === 'en' || saved === 'vi' ? saved : 'en';
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
        isMuted={isMuted}
        onToggleMute={toggleMute}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Tab Viewport (Routes for each tab, Responsive Scroll for Mobile, Zero Scroll on Desktop) */}
      <main className="flex-1 w-full overflow-y-auto md:overflow-hidden relative">
        <Routes>
          <Route
            path="/"
            element={
              <HomeTab
                language={language}
                onStart={() => navigate('/photobooth')}
                onGoToStudio={() => navigate('/studio')}
              />
            }
          />
          <Route
            path="/home"
            element={
              <HomeTab
                language={language}
                onStart={() => navigate('/photobooth')}
                onGoToStudio={() => navigate('/studio')}
              />
            }
          />
          <Route
            path="/photobooth"
            element={
              <BoothTab language={language} onBackToHome={() => navigate('/')} />
            }
          />
          <Route
            path="/booth"
            element={
              <BoothTab language={language} onBackToHome={() => navigate('/')} />
            }
          />
          <Route path="/studio" element={<StudioTab language={language} />} />
          <Route
            path="/how-to-use"
            element={
              <GuideTab
                language={language}
                onStartBooth={() => navigate('/photobooth')}
              />
            }
          />
          <Route
            path="/guide"
            element={
              <GuideTab
                language={language}
                onStartBooth={() => navigate('/photobooth')}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
