import test from 'node:test';
import assert from 'node:assert/strict';
import { getFrameCaptionBox, type CaptionBox, type PhotoSlotBounds } from '../src/components/Photobooth/frameCaption.ts';
import { CUSTOM_FRAMES } from '../src/components/Photobooth/FrameThemes.ts';

function assertCaptionFits(box: CaptionBox, width: number, height: number, slots: PhotoSlotBounds[]): void {
  const lastBottom = Math.max(...slots.map((slot) => slot.y + slot.h));
  assert.equal(box.centerX, width / 2, 'caption is horizontally centered');
  assert.equal(box.maxWidth, width - 80, 'caption keeps an 80px side gutter');
  assert.ok(box.fontSize >= 22 && box.fontSize <= 48, `font size in [22, 48], got ${box.fontSize}`);
  assert.ok(box.centerY - box.fontSize / 2 > lastBottom, 'caption starts below the last slot');
  assert.ok(box.centerY + box.fontSize / 2 < height, 'caption ends inside the frame');
}

test('a portrait frame yields a caption box centered in the band below its slot', () => {
  const slots = [{ x: 42, y: 90, w: 1155, h: 1347 }];
  const box = getFrameCaptionBox(1240, 1844, slots, 'HAPPY BIRTHDAY');
  assert.ok(box);
  assertCaptionFits(box, 1240, 1844, slots);
});

test('a narrow landscape band shrinks the caption font', () => {
  const slots = [
    { x: 85, y: 135, w: 534, h: 400 },
    { x: 85, y: 705, w: 534, h: 400 },
  ];
  const box = getFrameCaptionBox(1844, 1240, slots, 'POSECLUB');
  assert.ok(box);
  assertCaptionFits(box, 1844, 1240, slots);
  assert.ok(box.fontSize < 48, 'a narrow band uses a smaller font than the 48px maximum');
});

test('no caption box without text or photo slots', () => {
  const slot = [{ x: 0, y: 0, w: 100, h: 100 }];
  assert.equal(getFrameCaptionBox(1240, 1844, slot, ''), null, 'empty text');
  assert.equal(getFrameCaptionBox(1240, 1844, slot, '   '), null, 'whitespace-only text');
  assert.equal(getFrameCaptionBox(1240, 1844, [], 'POSECLUB'), null, 'no slots');
});

test('a free band of 90px is the minimum; anything tighter yields no box', () => {
  const slot = [{ x: 0, y: 0, w: 100, h: 100 }];
  assert.equal(getFrameCaptionBox(500, 189, slot, 'X'), null, '89px band');
  const box = getFrameCaptionBox(500, 190, slot, 'X');
  assert.ok(box);
  assert.equal(box.fontSize, 22, 'the minimum font at the boundary');
  assertCaptionFits(box, 500, 190, slot);
});

test('a very tall free band clamps the caption font at 48px', () => {
  const box = getFrameCaptionBox(1240, 5000, [{ x: 0, y: 0, w: 100, h: 100 }], 'X');
  assert.ok(box);
  assert.equal(box.fontSize, 48);
});

test('every registered frame leaves room for the caption below its slots', () => {
  for (const frame of CUSTOM_FRAMES) {
    const slots = frame.slots ?? [];
    const box = getFrameCaptionBox(frame.imageWidth ?? 0, frame.imageHeight ?? 0, slots, 'POSECLUB');
    assert.ok(box, `${frame.id} has a caption box`);
    assertCaptionFits(box, frame.imageWidth ?? 0, frame.imageHeight ?? 0, slots);
  }
});
