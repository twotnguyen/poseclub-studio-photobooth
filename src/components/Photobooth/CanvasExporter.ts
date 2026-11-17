import type { FilterType, LayoutType, FrameTheme } from './types';
import { getThemeById } from './FrameThemes';
import { getLayoutGeometry } from './layouts';
import { getFilterCss, isLightColor } from './color';

interface RenderOptions {
  images: string[];
  layout: LayoutType;
  theme: FrameTheme;
  filter: FilterType;
  brandName: string;
  customFooterText?: string;
  location: string;
  dateStr: string;
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

const drawGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.04) => {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
};

export const renderPhotostripToCanvas = async (options: RenderOptions): Promise<HTMLCanvasElement> => {
  const { images, layout, theme, filter, brandName, customFooterText, location, dateStr } = options;
  const themeCfg = getThemeById(theme);

  // Custom Canva PNG frames have transparent photo slots. Paint each shot
  // into its measured slot, then lay the frame art over it so stickers stay
  // on top of the photos.
  if (themeCfg.imagePath && themeCfg.slots && themeCfg.slots.length > 0 && images.length > 0) {
    const frame = await loadImage(themeCfg.imagePath);
    const canvas = document.createElement('canvas');
    canvas.width = frame.naturalWidth;
    canvas.height = frame.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    for (let i = 0; i < themeCfg.slots.length && i < images.length; i++) {
      const photo = await loadImage(images[i]);
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
    return canvas;
  }

  const mainLabel = customFooterText?.trim() || themeCfg.barText || brandName;
  const geo = getLayoutGeometry(layout);
  const { width: W, height: H, footerY, footerHeight, cells } = geo;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Google Fonts load asynchronously; drawing earlier bakes in a fallback font.
  if (document.fonts?.ready) await document.fonts.ready;

  const [loadedImages] = await Promise.all([
    Promise.all(images.map((src) => loadImage(src))),
  ]);

  const isDark = !isLightColor(themeCfg.bgColor);
  const secondaryTextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';

  ctx.fillStyle = themeCfg.bgColor;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < cells.length && i < loadedImages.length; i++) {
    const img = loadedImages[i];
    const { x, y, w, h } = cells[i];
    ctx.save();
    applyCanvasFilter(ctx, filter);

    const targetAspect = w / h;
    const imgAspect = img.width / img.height;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (imgAspect > targetAspect) {
      sw = img.height * targetAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetAspect;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();

    ctx.strokeStyle = themeCfg.slotBorderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }

  ctx.save();
  ctx.fillStyle = themeCfg.textColor;
  ctx.font = `600 ${W >= 1800 ? 56 : 54}px "Playfair Display", "Cormorant Garamond", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mainLabel.toUpperCase(), W / 2, footerY + footerHeight * 0.32);

  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, footerY + footerHeight * 0.45);
  ctx.lineTo(W / 2 + 120, footerY + footerHeight * 0.45);
  ctx.stroke();

  ctx.fillStyle = secondaryTextColor;
  ctx.font = '500 24px "Inter", system-ui, sans-serif';
  ctx.fillText(`${location.toUpperCase()}  •  ${dateStr.toUpperCase()}`, W / 2, footerY + footerHeight * 0.58);

  if (H >= 3000) {
    ctx.font = '400 19px "Inter", monospace';
    ctx.fillStyle = secondaryTextColor;
    ctx.fillText('ORIGINAL PHOTOSTRIP ARCHIVE', W / 2, footerY + footerHeight * 0.75);
  }
  ctx.restore();

  if (filter === 'bw-film') drawGrain(ctx, W, H, 0.035);

  return canvas;
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  ctx.fillText(`SHOT 0${index + 1}  •  ${dateStr.toUpperCase()}`, W / 2, 1400);

  return canvas;
};

export const printCanvas = (canvas: HTMLCanvasElement, copies = 1) => {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print your photo strip.');
    return;
  }

  const total = Math.max(1, copies);
  const images = Array.from({ length: total }, () => `<img src="${dataUrl}" alt="poseclub studio photostrip" onload="if(--window.__pending===0){window.print();window.close();}" />`).join('');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Photostrip - poseclub studio</title>
        <script>window.__pending=${total};<\/script>
        <style>
          @page { size: auto; margin: 0mm; }
          body {
            margin: 0; padding: 10px; display: flex; flex-wrap: wrap;
            justify-content: center; align-items: center; gap: 10px;
            min-height: 100vh; background: #fff;
          }
          img { max-width: 95vw; max-height: 95vh; object-fit: contain; }
          @media print {
            body { padding: 0; gap: 0; }
            img { max-width: 100%; max-height: 100vh; }
          }
        </style>
      </head>
      <body>${images}</body>
    </html>
  `);
  printWindow.document.close();
};
