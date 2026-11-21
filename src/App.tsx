import { useEffect, useLayoutEffect, useState } from 'react';
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

const LANGUAGE_KEY = 'poseclub_lang';
const MUTED_KEY = 'poseclub_muted';

function readStoredValue(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage may be blocked; keep the app usable in memory.
  }
}

export default function App() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState<boolean>(() => readStoredValue(MUTED_KEY) === 'true');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = readStoredValue(LANGUAGE_KEY);
    return saved === 'en' || saved === 'vi' ? saved : 'en';
  });

  useEffect(() => {
    sounds.muted = isMuted;
    writeStoredValue(MUTED_KEY, String(isMuted));
  }, [isMuted]);

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    writeStoredValue(LANGUAGE_KEY, lang);
  };

  useLayoutEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleMute = () => setIsMuted(!isMuted);

  const homeTab = (
    <HomeTab
      language={language}
      onStart={() => navigate('/photobooth')}
      onGoToStudio={() => navigate('/studio')}
    />
  );
  const guideTab = (
    <GuideTab
      language={language}
      onStartBooth={() => navigate('/photobooth')}
    />
  );

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
          <Route path="/" element={homeTab} />
          <Route path="/home" element={homeTab} />
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
          <Route path="/how-to-use" element={guideTab} />
          <Route path="/guide" element={guideTab} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
