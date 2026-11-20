import React from 'react';
import { Outlet } from 'react-router-dom';
import { BoothProvider } from '../Photobooth/BoothContext';
import type { Language } from '../../i18n/translations';

interface BoothTabProps {
  language: Language;
  onBackToHome: () => void;
}

export const BoothTab: React.FC<BoothTabProps> = ({ language, onBackToHome }) => (
  <BoothProvider language={language} onBackToHome={onBackToHome}>
    <div className="h-full w-full flex flex-col justify-between p-1.5 sm:p-7 select-none">
      <Outlet />
    </div>
  </BoothProvider>
);
