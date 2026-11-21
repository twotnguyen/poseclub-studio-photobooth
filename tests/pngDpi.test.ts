import test from 'node:test';
import assert from 'node:assert/strict';
import { withPngDpi } from '../src/components/Photobooth/pngDpi.ts';

const ONE_PIXEL_PNG = new Uint8Array(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  )
);

interface Chunk {
  type: string;
  data: Buffer;
  crc: number;
  bytes: Buffer;
}

function parseChunks(input: Uint8Array): Chunk[] {
  const bytes = Buffer.from(input);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const chunks: Chunk[] = [];
  let offset = 8;
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    chunks.push({
      type,
      data: bytes.subarray(offset + 8, offset + 8 + length),
      crc: bytes.readUInt32BE(end - 4),
      bytes: bytes.subarray(offset, end),
    });
    offset = end;
  }
  return chunks;
}

test('exported PNG declares 300 DPI with a valid pHYs chunk', () => {
  const before = parseChunks(ONE_PIXEL_PNG);
  const after = parseChunks(withPngDpi(ONE_PIXEL_PNG, 300));
  const phys = after.find((chunk) => chunk.type === 'pHYs');

  assert.ok(phys);
  assert.equal(after.filter((chunk) => chunk.type === 'pHYs').length, 1);
  assert.equal(phys.data.readUInt32BE(0), 11811);
  assert.equal(phys.data.readUInt32BE(4), 11811);
  assert.equal(phys.data[8], 1);
  assert.equal(phys.crc, 0x78a53f76);

  assert.deepEqual(
    after.filter((chunk) => chunk.type !== 'pHYs').map((chunk) => chunk.bytes.toString('hex')),
    before.map((chunk) => chunk.bytes.toString('hex'))
  );
});

test('DPI parameter changes the pHYs payload', () => {
  const at300 = parseChunks(withPngDpi(ONE_PIXEL_PNG, 300)).find((chunk) => chunk.type === 'pHYs');
  const at600 = parseChunks(withPngDpi(ONE_PIXEL_PNG, 600)).find((chunk) => chunk.type === 'pHYs');

  assert.ok(at300);
  assert.ok(at600);
  assert.notEqual(at600.data.readUInt32BE(0), at300.data.readUInt32BE(0));
  assert.equal(at600.data.readUInt32BE(0), 23622);
  assert.equal(at600.data.readUInt32BE(4), 23622);
  assert.equal(at600.crc, 0x14944341);
});

test('invalid PNGs and DPI values are left untouched', () => {
  assert.deepEqual(withPngDpi(new Uint8Array([1, 2, 3]), 300), new Uint8Array([1, 2, 3]));
  assert.deepEqual(withPngDpi(ONE_PIXEL_PNG.subarray(0, 20), 300), ONE_PIXEL_PNG.subarray(0, 20));
  assert.deepEqual(withPngDpi(ONE_PIXEL_PNG, 0), ONE_PIXEL_PNG);
  assert.deepEqual(withPngDpi(ONE_PIXEL_PNG, -300), ONE_PIXEL_PNG);
  assert.deepEqual(withPngDpi(ONE_PIXEL_PNG, Number.NaN), ONE_PIXEL_PNG);
  assert.deepEqual(withPngDpi(ONE_PIXEL_PNG, Number.POSITIVE_INFINITY), ONE_PIXEL_PNG);
});

test('a PNG that already has pHYs is not stamped twice', () => {
  const once = withPngDpi(ONE_PIXEL_PNG, 300);
  const twice = withPngDpi(once, 300);

  assert.equal(parseChunks(twice).filter((chunk) => chunk.type === 'pHYs').length, 1);
  assert.deepEqual(Buffer.from(twice), Buffer.from(once));
});
