import test from 'node:test';
import assert from 'node:assert/strict';
import { getFilterCss } from '../src/components/Photobooth/color.ts';

test('one filter definition drives both the live preview and the export', () => {
  assert.equal(getFilterCss('bw-contrast'), 'grayscale(100%) contrast(140%) brightness(96%)');
  assert.equal(getFilterCss('bw-film'), 'grayscale(100%) contrast(115%) brightness(104%) sepia(8%)');
  assert.equal(getFilterCss('natural'), 'contrast(106%) brightness(102%) saturate(108%)');
});
