import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrintDocument } from '../src/components/Photobooth/printDocument.ts';

const PNG = 'data:image/png;base64,QUJD';
const STRINGS = { popupBlocked: 'Allow popups', printTitle: 'Print strip' };

test('print document embeds the image once regardless of copy count', () => {
  const doc = buildPrintDocument(PNG, 8, STRINGS);
  assert.equal(doc.split(PNG).length - 1, 1);
  assert.match(doc, /const total=8;/);
});

test('print document clamps copy count and localizes its title', () => {
  const doc = buildPrintDocument(PNG, 99, STRINGS);
  assert.match(doc, /const total=20;/);
  assert.match(doc, /<title>Print strip<\/title>/);
});
