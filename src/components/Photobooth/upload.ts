export const buildUploadedShots = (dataUrls: string[], required: number): string[] | null =>
  dataUrls.length === required ? [...dataUrls] : null;
