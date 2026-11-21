const IMAGE_DATA_URL = /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?;base64,([A-Za-z0-9+/]+={0,2})$/i;

const isImageDataUrl = (value: string): boolean => {
  const match = IMAGE_DATA_URL.exec(value);
  return match !== null && match[1].length % 4 === 0;
};

export const buildUploadedShots = (dataUrls: string[], required: number): string[] | null =>
  dataUrls.length === required && dataUrls.every(isImageDataUrl) ? [...dataUrls] : null;
