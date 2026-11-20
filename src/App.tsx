import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Language } from './i18n/translations';
import { HomeTab } from './components/tabs/HomeTab';
import { BoothTab } from './components/tabs/BoothTab';
import { StudioTab } from './components/tabs/StudioTab';
import { FrameSelectStep } from './components/Photobooth/steps/FrameSelectStep';
import { ThemeSelectStep } from './components/Photobooth/steps/ThemeSelectStep';
import { CaptureStep } from './components/Photobooth/steps/CaptureStep';
import { ConfirmStep } from './components/Photobooth/steps/ConfirmStep';
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

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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

      {/* Main Tab Viewport (Zero-scroll on all breakpoints) */}
      <main className="flex-1 w-full overflow-hidden relative">
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
          >
            <Route index element={<Navigate to="frame" replace />} />
            <Route path="frame" element={<FrameSelectStep />} />
            <Route path="theme" element={<ThemeSelectStep />} />
            <Route path="capture" element={<CaptureStep />} />
            <Route path="confirm" element={<ConfirmStep />} />
          </Route>
          <Route path="/booth" element={<Navigate to="/photobooth/frame" replace />} />
          <Route path="/booth/*" element={<Navigate to="/photobooth/frame" replace />} />
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
