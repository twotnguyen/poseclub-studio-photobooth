export type BoothStep = 'idle' | 'countdown' | 'flash' | 'review';

export type FilterType = 'bw-contrast' | 'bw-film' | 'natural';

export type LayoutType = 'strip-1x4' | 'grid-2x2';

export type FrameColor = 'black' | 'white';

export type FrameTheme =
  | 'classic-black'
  | 'classic-white'
  | 'stars'
  | 'doodle'
  | 'cutout'
  | 'hearts'
  | 'valentine'
  | 'be-valentine'
  | 'birthday'
  | 'brand';

export interface ShotItem {
  id: string;
  dataUrl: string;
}

export interface PhotoboothState {
  step: BoothStep;
  shots: string[];
  currentShotIndex: number;
  retakeIndex: number | null;
  countdown: number;
  countdownDuration: 3 | 5;
  isMirror: boolean;
  isMuted: boolean;
  filter: FilterType;
  layout: LayoutType;
  frameColor: FrameColor;
  dateStamp: string;
}
