import test from 'node:test';
import assert from 'node:assert/strict';
import { captionTextColor } from '../src/components/Photobooth/frameCaption.ts';

test('caption text is white on dark frame pixels', () => {
  assert.equal(captionTextColor(20, 30, 40), '#FFFFFF');
});

test('caption text is dark on light frame pixels', () => {
  assert.equal(captionTextColor(240, 240, 240), '#111111');
});

test('caption text switches at the 150 luminance cutoff', () => {
  assert.equal(captionTextColor(151, 151, 151), '#111111');
  assert.equal(captionTextColor(150, 150, 150), '#FFFFFF');
});

test('caption text uses weighted luminance for mixed channels', () => {
  assert.equal(captionTextColor(255, 0, 0), '#FFFFFF');
  assert.equal(captionTextColor(0, 255, 0), '#FFFFFF');
  assert.equal(captionTextColor(255, 220, 0), '#111111');
});

test('caption text blends the sampled pixel over white by alpha', () => {
  assert.equal(captionTextColor(0, 0, 0, 0), '#111111');
  assert.equal(captionTextColor(0, 0, 0, 64), '#111111');
  assert.equal(captionTextColor(0, 0, 0, 192), '#FFFFFF');
  assert.equal(captionTextColor(0, 0, 0, 255), '#FFFFFF');
  assert.equal(captionTextColor(255, 0, 0, 64), '#111111');
  assert.equal(captionTextColor(255, 0, 0, 200), '#FFFFFF');
});
