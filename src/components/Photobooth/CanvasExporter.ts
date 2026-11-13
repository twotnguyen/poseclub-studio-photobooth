import { FilterType, FrameColor, LayoutType } from './types';

interface RenderOptions {
  images: string[];
  layout: LayoutType;
  frameColor: FrameColor;
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
  switch (filter) {
    case 'bw-contrast':
      ctx.filter = 'grayscale(100%) contrast(140%) brightness(96%)';
      break;
    case 'bw-film':
      ctx.filter = 'grayscale(100%) contrast(115%) brightness(104%) sepia(8%)';
      break;
    case 'natural':
      ctx.filter = 'contrast(106%) brightness(102%) saturate(108%)';
      break;
    default:
      ctx.filter = 'none';
  }
};

const drawGrain = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity = 0.04) => {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
};

export const renderPhotostripToCanvas = async (options: RenderOptions): Promise<HTMLCanvasElement> => {
  const { images, layout, frameColor, filter, brandName, customFooterText, location, dateStr } = options;
  const mainLabel = customFooterText && customFooterText.trim().length > 0 ? customFooterText.trim() : brandName;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load all images in parallel
  const loadedImages = await Promise.all(images.map((src) => loadImage(src)));

  const isDark = frameColor === 'black';
  const bgColor = isDark ? '#0C0C0C' : '#FAF9F6';
  const primaryTextColor = isDark ? '#FFFFFF' : '#0C0C0C';
  const secondaryTextColor = isDark ? '#8A8A8A' : '#737373';
  const innerBorderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  if (layout === 'strip-1x4') {
    // 2x6 inch strip @ 300 DPI = 1200 x 3600 px
    const W = 1200;
    const H = 3600;
    canvas.width = W;
    canvas.height = H;

    // 1. Draw Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const padX = 80;
    const padTop = 80;
    const gap = 45;
    const bottomHeight = 440;

    const availableHeightForPhotos = H - padTop - bottomHeight - gap * 3;
    const photoH = availableHeightForPhotos / 4;
    const photoW = W - padX * 2;

    // 2. Draw each of the 4 photos
    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      const y = padTop + i * (photoH + gap);

      ctx.save();
      // Apply filter
      applyCanvasFilter(ctx, filter);

      // Center crop into photoW x photoH (aspect ratio approx 4:3)
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

      ctx.drawImage(img, sx, sy, sw, sh, padX, y, photoW, photoH);
      ctx.restore();

      // Subtle inner frame border around each photo
      ctx.strokeStyle = innerBorderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(padX, y, photoW, photoH);
    }

    // 3. Draw Branding & Footer
    const footerY = H - bottomHeight;
    ctx.save();

    // Brand Name (Editorial Serif)
    ctx.fillStyle = primaryTextColor;
    ctx.font = '600 54px "Playfair Display", "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainLabel.toUpperCase(), W / 2, footerY + 140);

    // Decorative line
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, footerY + 195);
    ctx.lineTo(W / 2 + 120, footerY + 195);
    ctx.stroke();

    // Subtitle & Location & Date
    ctx.fillStyle = secondaryTextColor;
    ctx.font = '500 24px "Inter", system-ui, sans-serif';
    ctx.fillText(`${location.toUpperCase()}  •  ${dateStr.toUpperCase()}`, W / 2, footerY + 245);

    // Subtle signature bottom tag
    ctx.font = '400 19px "Inter", monospace';
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    ctx.fillText('ORIGINAL PHOTOSTRIP ARCHIVE', W / 2, footerY + 310);

    ctx.restore();

  } else {
    // 4x6 inch print @ 300 DPI = 1800 x 2400 px (Grid 2x2)
    const W = 1800;
    const H = 2400;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const padX = 100;
    const padTop = 100;
    const gap = 50;
    const bottomHeight = 360;

    const photoW = (W - padX * 2 - gap) / 2;
    const photoH = (H - padTop - bottomHeight - gap) / 2;

    const coords = [
      { x: padX, y: padTop },
      { x: padX + photoW + gap, y: padTop },
      { x: padX, y: padTop + photoH + gap },
      { x: padX + photoW + gap, y: padTop + photoH + gap },
    ];

    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      const { x, y } = coords[i];

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

      ctx.drawImage(img, sx, sy, sw, sh, x, y, photoW, photoH);
      ctx.restore();

      ctx.strokeStyle = innerBorderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, photoW, photoH);
    }

    // Footer Branding
    const footerY = H - bottomHeight;
    ctx.save();

    ctx.fillStyle = primaryTextColor;
    ctx.font = '600 56px "Playfair Display", "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainLabel.toUpperCase(), W / 2, footerY + 120);

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150, footerY + 175);
    ctx.lineTo(W / 2 + 150, footerY + 175);
    ctx.stroke();

    ctx.fillStyle = secondaryTextColor;
    ctx.font = '500 24px "Inter", system-ui, sans-serif';
    ctx.fillText(`${location.toUpperCase()}  •  ${dateStr.toUpperCase()}`, W / 2, footerY + 225);

    ctx.restore();
  }

  // If film grain filter is chosen, add subtle procedural grain texture
  if (filter === 'bw-film') {
    drawGrain(ctx, canvas.width, canvas.height, 0.035);
  }

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

export const printCanvas = (canvas: HTMLCanvasElement) => {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print your photo strip.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Photostrip - poseclub studio</title>
        <style>
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            margin: 0;
            padding: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #fff;
          }
          img {
            max-width: 95vw;
            max-height: 95vh;
            object-fit: contain;
          }
          @media print {
            body {
              padding: 0;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
            }
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="poseclub studio photostrip" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
};
