import test from 'node:test';
import assert from 'node:assert/strict';
import { withPngDpi } from '../src/components/Photobooth/pngDpi.ts';

const ONE_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AF+pZUeAAAAAElFTkSuQmCC';

function parseChunks(dataUrl: string): { type: string; data: Buffer }[] {
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const chunks: { type: string; data: Buffer }[] = [];
  let offset = 8;
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) });
    offset += 12 + length;
  }
  return chunks;
}

test('exported PNG declares 300 DPI without changing its pixel data', () => {
  const before = parseChunks(ONE_PIXEL_PNG);
  const after = parseChunks(withPngDpi(ONE_PIXEL_PNG, 300));

  const phys = after.filter((chunk) => chunk.type === 'pHYs');
  assert.equal(phys.length, 1);
  assert.equal(phys[0].data.readUInt32BE(0), 11811);
  assert.equal(phys[0].data.readUInt32BE(4), 11811);
  assert.equal(phys[0].data[8], 1);

  assert.deepEqual(
    after.filter((chunk) => chunk.type === 'IHDR').map((chunk) => chunk.data.toString('hex')),
    before.filter((chunk) => chunk.type === 'IHDR').map((chunk) => chunk.data.toString('hex'))
  );
});
