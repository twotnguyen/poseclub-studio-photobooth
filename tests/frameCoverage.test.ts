import test from 'node:test';
import assert from 'node:assert/strict';
import { CUSTOM_FRAMES } from '../src/components/Photobooth/FrameThemes.ts';

test('every registered theme is a PNG overlay with measured photo slots', () => {
  assert.equal(CUSTOM_FRAMES.length, 72);
  for (const frame of CUSTOM_FRAMES) {
    assert.ok(frame.imagePath, `${frame.id} has an overlay PNG`);
    assert.ok(frame.slots && frame.slots.length > 0, `${frame.id} has photo slots`);
  }
});
