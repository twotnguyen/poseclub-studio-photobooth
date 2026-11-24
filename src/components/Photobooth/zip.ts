import { crc32 } from './crc32.ts';

export interface ZipFile {
  name: string;
  bytes: Uint8Array;
}

const encoder = new TextEncoder();
const LOCAL_HEADER = 30;
const CENTRAL_HEADER = 46;
const UTF8_FLAG = 0x0800;

/** Builds a store-only ZIP: PNG bytes are already compressed, so no deflate is needed. */
export const buildZip = (files: ZipFile[]): Blob => {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  let centralSize = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.bytes);
    const size = file.bytes.length;

    const local = new Uint8Array(LOCAL_HEADER + name.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, UTF8_FLAG, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, size, true);
    localView.setUint32(22, size, true);
    localView.setUint16(26, name.length, true);
    local.set(name, LOCAL_HEADER);
    localParts.push(local, file.bytes);

    const central = new Uint8Array(CENTRAL_HEADER + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, UTF8_FLAG, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, size, true);
    centralView.setUint32(24, size, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    central.set(name, CENTRAL_HEADER);
    centralParts.push(central);

    offset += local.length + size;
    centralSize += central.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  const parts = [...localParts, ...centralParts, end];
  const output = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.length;
  }

  return new Blob([output.buffer], { type: 'application/zip' });
};
