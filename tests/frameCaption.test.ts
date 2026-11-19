import test from 'node:test';
import assert from 'node:assert/strict';
import { getFrameCaptionBox } from '../src/components/Photobooth/frameCaption.ts';
import { CUSTOM_FRAMES } from '../src/components/Photobooth/FrameThemes.ts';

test('caption sits in the free band below a style 1 photo slot', () => {
  const box = getFrameCaptionBox(1240, 1844, [{ x: 42, y: 90, w: 1155, h: 1347 }], 'HAPPY BIRTHDAY');
  assert.deepEqual(box, { centerX: 620, centerY: 1510, fontSize: 48, maxWidth: 1160 });
});

test('caption shrinks to fit a landscape frame with a narrow band', () => {
  const box = getFrameCaptionBox(1844, 1240, [{ x: 85, y: 135, w: 534, h: 400 }, { x: 85, y: 705, w: 534, h: 400 }], 'POSECLUB');
  assert.deepEqual(box, { centerX: 922, centerY: 1135, fontSize: 30, maxWidth: 1764 });
});

test('every registered frame leaves room for the caption below its slots', () => {
  for (const frame of CUSTOM_FRAMES) {
    const slots = frame.slots ?? [];
    const lastBottom = Math.max(...slots.map((slot) => slot.y + slot.h));
    const box = getFrameCaptionBox(frame.imageWidth ?? 0, frame.imageHeight ?? 0, slots, 'POSECLUB');
    assert.ok(box, `${frame.id} has a caption box`);
    assert.ok(box.centerY - box.fontSize / 2 > lastBottom, `${frame.id} caption starts below the last slot`);
    assert.ok(box.centerY + box.fontSize / 2 < (frame.imageHeight ?? 0), `${frame.id} caption ends inside the frame`);
  }
});
