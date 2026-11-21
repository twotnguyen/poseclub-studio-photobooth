const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let value = n;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

/** Adds a pHYs chunk so printers read the exported PNG at the requested DPI. */
export const withPngDpi = (bytes: Uint8Array, dpi: number): Uint8Array<ArrayBuffer> => {
  const ihdrLength = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(8);
  const insertAt = 8 + 12 + ihdrLength;

  const phys = new Uint8Array(21);
  const view = new DataView(phys.buffer);
  view.setUint32(0, 9);
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // pHYs
  view.setUint32(8, Math.round(dpi / 0.0254)); // pixels per metre, X
  view.setUint32(12, Math.round(dpi / 0.0254)); // pixels per metre, Y
  phys[16] = 1; // metre unit
  view.setUint32(17, crc32(phys.subarray(4, 17)));

  const output = new Uint8Array(bytes.length + phys.length);
  output.set(bytes.subarray(0, insertAt), 0);
  output.set(phys, insertAt);
  output.set(bytes.subarray(insertAt), insertAt + phys.length);
  return output;
};
