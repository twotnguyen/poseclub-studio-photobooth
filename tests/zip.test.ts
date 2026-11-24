import test from 'node:test';
import assert from 'node:assert/strict';
import { buildZip } from '../src/components/Photobooth/zip.ts';

const encoder = new TextEncoder();

interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

function readStoredEntries(zip: Uint8Array): ZipEntry[] {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  let eocd = -1;
  for (let offset = zip.length - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  assert.ok(eocd >= 0, 'end of central directory found');

  const total = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];
  for (let i = 0; i < total; i += 1) {
    assert.equal(view.getUint32(offset, true), 0x02014b50, 'central directory signature');
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(zip.subarray(offset + 46, offset + 46 + nameLength));

    assert.equal(view.getUint32(localOffset, true), 0x04034b50, 'local file signature');
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const size = view.getUint32(localOffset + 18, true);
    entries.push({ name, bytes: zip.subarray(dataStart, dataStart + size) });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

test('buildZip stores every file under its own name with intact bytes', async () => {
  const blob = buildZip([
    { name: 'shot-01.png', bytes: encoder.encode('first-photo') },
    { name: 'shot-02.png', bytes: encoder.encode('second-photo') },
  ]);
  const zip = new Uint8Array(await blob.arrayBuffer());

  assert.deepEqual(readStoredEntries(zip), [
    { name: 'shot-01.png', bytes: encoder.encode('first-photo') },
    { name: 'shot-02.png', bytes: encoder.encode('second-photo') },
  ]);
});

test('buildZip returns an empty archive when there are no files', async () => {
  const zip = new Uint8Array(await buildZip([]).arrayBuffer());
  assert.deepEqual(readStoredEntries(zip), []);
});
