export interface PhotoSlotBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CaptionBox {
  centerX: number;
  centerY: number;
  fontSize: number;
  maxWidth: number;
}
/** Keeps the customer's typing exactly as entered, including letter case. */
export const formatCaptionText = (text: string): string => text.trim();

export const getFrameCaptionBox = (
  width: number,
  height: number,
  slots: PhotoSlotBounds[],
  text: string
): CaptionBox | null => {
  if (!text.trim() || slots.length === 0) return null;

  const lastBottom = slots.reduce((max, slot) => Math.max(max, slot.y + slot.h), 0);
  const band = height - lastBottom;
  if (band < 90) return null;

  const fontSize = Math.round(Math.min(48, Math.max(22, band * 0.22)));
  const centerY = Math.round(lastBottom + Math.max(30, band * 0.18));
  return { centerX: width / 2, centerY, fontSize, maxWidth: width - 80 };
};

export const captionTextColor = (r: number, g: number, b: number, a = 255): string => {
  const alpha = a / 255;
  const blend = (channel: number) => Math.round(channel * alpha + 255 * (1 - alpha));
  const luminance = 0.299 * blend(r) + 0.587 * blend(g) + 0.114 * blend(b);
  return luminance > 150 ? '#111111' : '#FFFFFF';
};
