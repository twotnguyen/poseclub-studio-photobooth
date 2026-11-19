export const isStripComplete = (shots: string[], totalShots: number): boolean =>
  totalShots > 0 && shots.length === totalShots && shots.every((shot) => !!shot);
