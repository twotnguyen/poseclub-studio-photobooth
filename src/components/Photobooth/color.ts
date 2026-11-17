import type { FilterType } from './types';

export const getFilterCss = (filter: FilterType): string => {
  switch (filter) {
    case 'bw-contrast':
      return 'grayscale(100%) contrast(140%) brightness(96%)';
    case 'bw-film':
      return 'grayscale(100%) contrast(115%) brightness(104%) sepia(8%)';
    case 'natural':
      return 'contrast(106%) brightness(102%) saturate(108%)';
    default:
      return 'none';
  }
};

export const isLightColor = (hex: string): boolean => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};
