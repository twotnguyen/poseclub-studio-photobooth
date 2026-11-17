import test from 'node:test';
import assert from 'node:assert/strict';
import { getLayoutForStyle, getLayoutGeometry } from '../src/components/Photobooth/layouts.ts';
import { isLightColor, getFilterCss } from '../src/components/Photobooth/color.ts';

// Expected values are hand-copied from scripts/export_all_frames.py:110-117,
// which is the independent spec for the six printable layouts.
const EXPECTED = [
  { style: 1, width: 1200, height: 1500, slots: 1, rows: 1, cols: 1 },
  { style: 2, width: 1200, height: 3600, slots: 2, rows: 2, cols: 1 },
  { style: 3, width: 1800, height: 2400, slots: 4, rows: 2, cols: 2 },
  { style: 4, width: 1200, height: 3600, slots: 4, rows: 4, cols: 1 },
  { style: 5, width: 1800, height: 2400, slots: 6, rows: 3, cols: 2 },
  { style: 6, width: 1800, height: 2400, slots: 9, rows: 3, cols: 3 },
];

test('each frame style maps to its own printable canvas and slot count', () => {
  for (const want of EXPECTED) {
    const geo = getLayoutGeometry(getLayoutForStyle(want.style));
    assert.equal(geo.width, want.width, `style ${want.style} width`);
    assert.equal(geo.height, want.height, `style ${want.style} height`);
    assert.equal(geo.cells.length, want.slots, `style ${want.style} slot count`);
    assert.equal(geo.rows, want.rows, `style ${want.style} rows`);
    assert.equal(geo.cols, want.cols, `style ${want.style} cols`);
  }
});

test('every photo cell stays on the canvas above the footer', () => {
  for (const want of EXPECTED) {
    const geo = getLayoutGeometry(getLayoutForStyle(want.style));
    assert.equal(geo.cells.length, want.slots, `style ${want.style} has one cell per shot`);
    for (const cell of geo.cells) {
      assert.ok(Number.isFinite(cell.x + cell.y + cell.w + cell.h), 'cell has no NaN');
      assert.ok(cell.x >= 0 && cell.y >= 0, 'cell starts inside canvas');
      assert.ok(cell.x + cell.w <= geo.width, 'cell ends before right edge');
      assert.ok(cell.y + cell.h <= geo.footerY, 'cell ends before footer');
    }
  }
});

test('light theme backgrounds are detected so footer text stays dark', () => {
  assert.equal(isLightColor('#E5DFD5'), true, 'birthday background is light');
  assert.equal(isLightColor('#D6D3D1'), true, 'brand background is light');
  assert.equal(isLightColor('#FAF9F6'), true, 'classic-white background is light');
  assert.equal(isLightColor('#0C0C0C'), false, 'classic-black background is dark');
  assert.equal(isLightColor('#18171A'), false, 'stars background is dark');
});

test('one filter definition drives both the live preview and the export', () => {
  assert.equal(getFilterCss('bw-contrast'), 'grayscale(100%) contrast(140%) brightness(96%)');
  assert.equal(getFilterCss('bw-film'), 'grayscale(100%) contrast(115%) brightness(104%) sepia(8%)');
  assert.equal(getFilterCss('natural'), 'contrast(106%) brightness(102%) saturate(108%)');
});
