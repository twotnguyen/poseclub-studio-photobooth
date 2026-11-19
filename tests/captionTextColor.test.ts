import test from 'node:test';
import assert from 'node:assert/strict';
import { captionTextColor } from '../src/components/Photobooth/frameCaption.ts';

test('caption text is white on dark frame pixels', () => {
  assert.equal(captionTextColor(20, 30, 40), '#FFFFFF');
});

test('caption text is dark on light frame pixels', () => {
  assert.equal(captionTextColor(240, 240, 240), '#111111');
});

test('caption text switches at the same luminance threshold as the export', () => {
  assert.equal(captionTextColor(151, 151, 151), '#111111');
  assert.equal(captionTextColor(150, 150, 150), '#FFFFFF');
});
