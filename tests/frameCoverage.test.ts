import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUSTOM_FRAMES } from '../src/components/Photobooth/FrameThemes.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// [style]: slots per frame / frames per style
const frameShapeByStyle: Record<number, { slots: number; frames: number }> = {
  1: { slots: 1, frames: 23 },
  2: { slots: 2, frames: 9 },
  3: { slots: 4, frames: 10 },
  4: { slots: 8, frames: 10 },
  5: { slots: 6, frames: 15 },
  6: { slots: 9, frames: 5 },
};

test('every registered frame points at a PNG that exists on disk', () => {
  assert.equal(CUSTOM_FRAMES.length, 72);
  const missing: string[] = [];
  for (const frame of CUSTOM_FRAMES) {
    assert.ok(frame.imagePath, `${frame.id} declares an imagePath`);
    const diskPath = path.join(repoRoot, 'public', frame.imagePath!.replace(/^\/+/, ''));
    if (!existsSync(diskPath)) missing.push(`${frame.id}: ${frame.imagePath} -> ${diskPath}`);
  }
  assert.deepEqual(missing, [], `missing frame overlays:\n${missing.join('\n')}`);
});

test('each style has its expected number of slots and frames', () => {
  const framesByStyle: Record<number, number> = {};
  for (const frame of CUSTOM_FRAMES) {
    const shape = frameShapeByStyle[frame.style];
    assert.ok(shape, `${frame.id} belongs to a known style (${frame.style})`);
    assert.ok(frame.slots, `${frame.id} has photo slots`);
    assert.equal(frame.slots!.length, shape.slots, `${frame.id} (style ${frame.style}) slot count`);
    framesByStyle[frame.style] = (framesByStyle[frame.style] ?? 0) + 1;
  }
  assert.deepEqual(Object.keys(framesByStyle).sort(), ['1', '2', '3', '4', '5', '6']);
  assert.deepEqual(framesByStyle, Object.fromEntries(
    Object.entries(frameShapeByStyle).map(([style, shape]) => [style, shape.frames]),
  ));
});
