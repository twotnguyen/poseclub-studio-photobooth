import test from 'node:test';
import assert from 'node:assert/strict';
import { getFilterCss } from '../src/components/Photobooth/color.ts';
import type { FilterType } from '../src/components/Photobooth/types.ts';

const filterCssByType: Record<FilterType, string> = {
  'bw-contrast': 'grayscale(100%) contrast(140%) brightness(96%)',
  'bw-film': 'grayscale(100%) contrast(115%) brightness(104%) sepia(8%)',
  natural: 'contrast(106%) brightness(102%) saturate(108%)',
};

test('getFilterCss maps every FilterType to its CSS filter string', () => {
  const types = Object.keys(filterCssByType) as FilterType[];
  assert.deepEqual(types.sort(), ['bw-contrast', 'bw-film', 'natural']);
  for (const type of types) {
    assert.equal(getFilterCss(type), filterCssByType[type], `${type}`);
  }
});
