import type { LayoutType } from './types';

export interface PhotoCell {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutGeometry {
  width: number;
  height: number;
  rows: number;
  cols: number;
  footerY: number;
  footerHeight: number;
  cells: PhotoCell[];
}

export const LAYOUT_SPECS: Record<LayoutType, { width: number; height: number; slots: number; rows: number; cols: number }> = {
  polaroid: { width: 1200, height: 1500, slots: 1, rows: 1, cols: 1 },
  'strip-1x2': { width: 1200, height: 3600, slots: 2, rows: 2, cols: 1 },
  'grid-2x2': { width: 1800, height: 2400, slots: 4, rows: 2, cols: 2 },
  'strip-1x4': { width: 1200, height: 3600, slots: 4, rows: 4, cols: 1 },
  'grid-2x3': { width: 1800, height: 2400, slots: 6, rows: 3, cols: 2 },
  'grid-3x3': { width: 1800, height: 2400, slots: 9, rows: 3, cols: 3 },
};

const STYLE_LAYOUTS: LayoutType[] = [
  'polaroid',
  'strip-1x2',
  'grid-2x2',
  'strip-1x4',
  'grid-2x3',
  'grid-3x3',
];

export const getLayoutForStyle = (styleId: number): LayoutType =>
  STYLE_LAYOUTS[styleId - 1] ?? 'strip-1x4';

export const getLayoutSpec = (layout: LayoutType) => LAYOUT_SPECS[layout];

export const getLayoutGeometry = (layout: LayoutType): LayoutGeometry => {
  const { width, height, slots, rows, cols } = LAYOUT_SPECS[layout];
  const padX = cols === 1 ? 80 : 100;
  const padTop = cols === 1 ? 80 : 100;
  const gap = cols === 1 ? 45 : 50;
  const footerHeight = height >= 3000 ? 440 : 360;
  const footerY = height - footerHeight;

  const cellW = (width - padX * 2 - gap * (cols - 1)) / cols;
  const cellH = (footerY - padTop - gap * (rows - 1)) / rows;

  const cells: PhotoCell[] = Array.from({ length: slots }, (_, i) => ({
    x: padX + (i % cols) * (cellW + gap),
    y: padTop + Math.floor(i / cols) * (cellH + gap),
    w: cellW,
    h: cellH,
  }));

  return { width, height, rows, cols, footerY, footerHeight, cells };
};
