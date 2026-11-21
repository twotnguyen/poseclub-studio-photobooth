import type { FilterType, FrameTheme } from './types';
import { getThemeById } from './FrameThemes';
import { getFilterCss } from './color';
import { getFrameCaptionBox, captionTextColor } from './frameCaption';
import { withPngDpi } from './pngDpi';
import { buildPrintDocument } from './printDocument';

interface RenderOptions {
  images: string[];
  theme: FrameTheme;
  filter: FilterType;
  customFooterText?: string;
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const applyCanvasFilter = (ctx: CanvasRenderingContext2D, filter: FilterType) => {
  ctx.filter = getFilterCss(filter);
};

const GRAIN_TILE = 256;
const grainTiles = new Map<number, HTMLCanvasElement>();

const getGrainTile = (intensity: number): HTMLCanvasElement | null => {
  const cached = grainTiles.get(intensity);
  if (cached) return cached;
  const tile = document.createElement('canvas');
  tile.width = GRAIN_TILE;
  tile.height = GRAIN_TILE;
  const tileCtx = tile.getContext('2d');
  if (!tileCtx) return null;

  const image = tileCtx.createImageData(GRAIN_TILE, GRAIN_TILE);
  const alpha = Math.round(intensity * 255);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.random() * 255;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = alpha;
  }
  tileCtx.putImageData(image, 0, 0);
  grainTiles.set(intensity, tile);
  return tile;
};

const createGrainPattern = (ctx: CanvasRenderingContext2D, intensity: number): CanvasPattern | null => {
  const tile = getGrainTile(intensity);
  return tile ? ctx.createPattern(tile, 'repeat') : null;
};

const drawGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.04) => {
  const pattern = createGrainPattern(ctx, intensity);
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

export const renderPhotostripToCanvas = async (options: RenderOptions): Promise<HTMLCanvasElement> => {
  const { images, theme, filter, customFooterText } = options;
  const themeCfg = getThemeById(theme);

  // Custom Canva PNG frames have transparent photo slots. Paint each shot
  // into its measured slot, then lay the frame art over it so stickers stay
  // on top of the photos.
  if (themeCfg.imagePath && themeCfg.slots && themeCfg.slots.length > 0 && images.length === themeCfg.slots.length) {
    const [frame, ...photos] = await Promise.all([
      loadImage(themeCfg.imagePath),
      ...images.map((src) => loadImage(src)),
    ]);
    const canvas = document.createElement('canvas');
    canvas.width = frame.naturalWidth;
    canvas.height = frame.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    for (let i = 0; i < themeCfg.slots.length; i++) {
      const photo = photos[i];
      const { x, y, w, h } = themeCfg.slots[i];
      const targetAspect = w / h;
      const imgAspect = photo.width / photo.height;
      let sx = 0, sy = 0, sw = photo.width, sh = photo.height;
      if (imgAspect > targetAspect) {
        sw = photo.height * targetAspect;
        sx = (photo.width - sw) / 2;
      } else {
        sh = photo.width / targetAspect;
        sy = (photo.height - sh) / 2;
      }
      applyCanvasFilter(ctx, filter);
      ctx.drawImage(photo, sx, sy, sw, sh, x, y, w, h);
      ctx.filter = 'none';
    }
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    const captionText = (customFooterText ?? '').trim();
    const caption = getFrameCaptionBox(canvas.width, canvas.height, themeCfg.slots, captionText);
    if (caption) {
      if (document.fonts?.ready) await document.fonts.ready;
      const [r, g, b, a] = ctx.getImageData(caption.centerX, caption.centerY, 1, 1).data;
      ctx.fillStyle = captionTextColor(r, g, b, a);
      ctx.font = `600 ${caption.fontSize}px "Playfair Display", "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(captionText.toUpperCase(), caption.centerX, caption.centerY, caption.maxWidth);
    }
    if (filter === 'bw-film') drawGrain(ctx, canvas.width, canvas.height, 0.035);
    return canvas;
  }
  throw new Error('Frame overlay or photos are missing');
};

const toDpiPngBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('PNG export failed'))), 'image/png');
  });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const out = withPngDpi(bytes, 300);
  return new Blob([out], { type: 'image/png' });
};

export const downloadCanvas = async (canvas: HTMLCanvasElement, filename: string): Promise<void> => {
  const url = URL.createObjectURL(await toDpiPngBlob(canvas));
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const renderIndividualPhoto = async (
  imageSrc: string,
  index: number,
  filter: FilterType,
  brandName: string,
  dateStr: string
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  const W = 1200;
  const H = 1500;
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#EEEEEE';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  if (document.fonts?.ready) await document.fonts.ready;
  const img = await loadImage(imageSrc);
  const photoW = W - 120;
  const photoH = 1180;

  ctx.save();
  applyCanvasFilter(ctx, filter);
  const targetAspect = photoW / photoH;
  const imgAspect = img.width / img.height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgAspect > targetAspect) {
    sw = img.height * targetAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetAspect;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 60, 60, photoW, photoH);
  ctx.restore();

  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, photoW, photoH);

  ctx.fillStyle = '#111111';
  ctx.font = '600 38px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(brandName.toUpperCase(), W / 2, 1340);

  ctx.fillStyle = '#777777';
  ctx.font = '500 20px "Inter", sans-serif';
  ctx.fillText(`SHOT ${String(index + 1).padStart(2, '0')}  •  ${dateStr.toUpperCase()}`, W / 2, 1400);

  if (filter === 'bw-film') drawGrain(ctx, W, H, 0.035);
  return canvas;
};

export const printCanvas = async (
  canvas: HTMLCanvasElement,
  copies = 1,
  strings: { printTitle: string },
  printWindow: Window
): Promise<void> => {
  const url = URL.createObjectURL(await toDpiPngBlob(canvas));
  printWindow.document.write(buildPrintDocument(url, copies, strings));
  printWindow.document.close();
};
