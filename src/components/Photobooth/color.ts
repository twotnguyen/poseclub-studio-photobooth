import type { FilterType } from './types';

export const getFilterCss = (filter: FilterType): string => {
  switch (filter) {
    case 'bw-contrast':
      return 'grayscale(100%) contrast(140%) brightness(96%)';
    case 'bw-film':
      return 'grayscale(100%) contrast(115%) brightness(104%) sepia(8%)';
    case 'natural':
      return 'contrast(106%) brightness(102%) saturate(108%)';
    default: {
      const exhaustive: never = filter;
      void exhaustive;
      return 'none';
    }
  }
};
