import { FrameTheme } from './types';

export interface ThemeConfig {
  id: FrameTheme;
  nameVi: string;
  nameEn: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  slotBorderColor: string;
  slotBgDefault: string;
  icon: string;
  tagline?: string;
  isTextBar?: boolean;
  barText?: string;
}

export const FRAME_THEMES: ThemeConfig[] = [
  {
    id: 'classic-black',
    nameVi: 'Classic Black',
    nameEn: 'Classic Black',
    bgColor: '#0C0C0C',
    textColor: '#FFFFFF',
    borderColor: '#1E1E1E',
    slotBorderColor: '#2A2A2A',
    slotBgDefault: '#1C1C1E',
    icon: '⬛',
  },
  {
    id: 'classic-white',
    nameVi: 'Classic White',
    nameEn: 'Classic White',
    bgColor: '#FAF9F6',
    textColor: '#0C0C0C',
    borderColor: '#E5E5E5',
    slotBorderColor: '#D4D4D8',
    slotBgDefault: '#F4F4F5',
    icon: '⬜',
  },
  {
    id: 'stars',
    nameVi: 'Gold Stars',
    nameEn: 'Gold Stars',
    bgColor: '#18171A',
    textColor: '#E5C158',
    borderColor: '#E5C158',
    slotBorderColor: '#E5C158',
    slotBgDefault: '#26242B',
    icon: '✦',
    tagline: 'Gilded Starlight',
  },
  {
    id: 'doodle',
    nameVi: 'Doodle Hearts',
    nameEn: 'Doodle Hearts',
    bgColor: '#2D282A',
    textColor: '#E11D48',
    borderColor: '#E11D48',
    slotBorderColor: '#E11D48',
    slotBgDefault: '#3D3437',
    icon: '♥',
    tagline: 'Hand-drawn Crimson Hearts',
  },
  {
    id: 'cutout',
    nameVi: 'Cutout Hearts',
    nameEn: 'Cutout Hearts',
    bgColor: '#FCE7ED',
    textColor: '#9F1239',
    borderColor: '#BE123C',
    slotBorderColor: '#E11D48',
    slotBgDefault: '#4A4045',
    icon: '♡',
    tagline: 'Heart Cutouts & Bows',
  },
  {
    id: 'hearts',
    nameVi: 'Hearts & Ribbons',
    nameEn: 'Hearts & Ribbons',
    bgColor: '#383335',
    textColor: '#FDA4AF',
    borderColor: '#FB7185',
    slotBorderColor: '#FDA4AF',
    slotBgDefault: '#453E41',
    icon: '🎀',
    tagline: 'Floating Ribbon & Hearts',
  },
  {
    id: 'valentine',
    nameVi: 'Happy Valentine',
    nameEn: 'Happy Valentine',
    bgColor: '#FBCFE8',
    textColor: '#831843',
    borderColor: '#F472B6',
    slotBorderColor: '#9D174D',
    slotBgDefault: '#504449',
    icon: '💌',
    isTextBar: true,
    barText: "HAPPY VALENTINE'S DAY",
  },
  {
    id: 'be-valentine',
    nameVi: 'Be My Valentine',
    nameEn: 'Be My Valentine',
    bgColor: '#FCE7F3',
    textColor: '#9D174D',
    borderColor: '#F472B6',
    slotBorderColor: '#BE185D',
    slotBgDefault: '#4E4449',
    icon: '💖',
    isTextBar: true,
    barText: 'be my valentine? ♥',
  },
  {
    id: 'birthday',
    nameVi: 'Happy Birthday',
    nameEn: 'Happy Birthday',
    bgColor: '#E5DFD5',
    textColor: '#44403C',
    borderColor: '#A8A29E',
    slotBorderColor: '#78716C',
    slotBgDefault: '#57534E',
    icon: '🎂',
    isTextBar: true,
    barText: 'HAPPY BIRTHDAY',
  },
  {
    id: 'brand',
    nameVi: 'Poseclub Signature',
    nameEn: 'Poseclub Signature',
    bgColor: '#D6D3D1',
    textColor: '#1C1917',
    borderColor: '#78716C',
    slotBorderColor: '#44403C',
    slotBgDefault: '#44403C',
    icon: '🏛️',
    isTextBar: true,
    barText: 'POSECLUB STUDIO',
  },
];

export const getThemeById = (id: FrameTheme): ThemeConfig => {
  return FRAME_THEMES.find((t) => t.id === id) || FRAME_THEMES[0];
};
