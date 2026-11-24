import { crc32 } from './crc32.ts';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Adds a pHYs chunk so printers read the exported PNG at the requested DPI. */
export const withPngDpi = (bytes: Uint8Array, dpi: number): Uint8Array<ArrayBuffer> => {
  const unchanged = bytes as Uint8Array<ArrayBuffer>;
  if (!Number.isFinite(dpi) || dpi <= 0) return unchanged;
  if (bytes.length < 33 || PNG_SIGNATURE.some((byte, i) => bytes[i] !== byte)) return unchanged;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const insertAt = 8 + 12 + view.getUint32(8);
  if (insertAt < 33 || insertAt > bytes.length) return unchanged;

  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    if (type === 'pHYs') return unchanged;
    if (type === 'IEND') break;
    offset += 12 + length;
  }

  const phys = new Uint8Array(21);
  const physView = new DataView(phys.buffer);
  physView.setUint32(0, 9);
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // pHYs
  physView.setUint32(8, Math.round(dpi / 0.0254)); // pixels per metre, X
  physView.setUint32(12, Math.round(dpi / 0.0254)); // pixels per metre, Y
  phys[16] = 1; // metre unit
  physView.setUint32(17, crc32(phys.subarray(4, 17)));

  const output = new Uint8Array(bytes.length + phys.length);
  output.set(bytes.subarray(0, insertAt), 0);
  output.set(phys, insertAt);
  output.set(bytes.subarray(insertAt), insertAt + phys.length);
  return output;
};
