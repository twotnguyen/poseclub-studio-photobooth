export const isStripComplete = (shots: string[], totalShots: number): boolean =>
  totalShots > 0 && shots.length === totalShots && shots.every((shot) => !!shot);

export const shouldRestartCapture = (
  shots: string[],
  totalShots: number,
  retakeIndex: number | null
): boolean => retakeIndex === null && isStripComplete(shots, totalShots);
