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

const decodeBase64 = (dataUrl: string): Uint8Array => {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const encodeBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

/** Adds a pHYs chunk so printers read the exported PNG at the requested DPI. */
export const withPngDpi = (dataUrl: string, dpi: number): string => {
  const bytes = decodeBase64(dataUrl);
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
  return `data:image/png;base64,${encodeBase64(output)}`;
};
