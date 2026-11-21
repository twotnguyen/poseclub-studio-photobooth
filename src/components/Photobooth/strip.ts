export const isStripComplete = (shots: string[], totalShots: number): boolean => {
  if (totalShots <= 0 || shots.length !== totalShots) return false;
  for (let i = 0; i < totalShots; i += 1) {
    if (!shots[i]) return false;
  }
  return true;
};

export const shouldRestartCapture = (
  shots: string[],
  totalShots: number,
  retakeIndex: number | null
): boolean => retakeIndex === null && isStripComplete(shots, totalShots);
