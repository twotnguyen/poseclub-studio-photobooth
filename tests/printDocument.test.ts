import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildPrintDocument } from '../src/components/Photobooth/printDocument.ts';

const PNG = 'data:image/png;base64,QUJD';
const STRINGS = { printTitle: 'Print strip' };

test('print document embeds the image once regardless of copy count', () => {
  const doc = buildPrintDocument(PNG, 8, STRINGS);
  assert.equal(doc.split(PNG).length - 1, 1);
  assert.match(doc, /const\s+total\s*=\s*8\s*;/);
});

test('print document clamps copy count at both ends', () => {
  assert.match(buildPrintDocument(PNG, 0, STRINGS), /const\s+total\s*=\s*1\s*;/);
  assert.match(buildPrintDocument(PNG, 99, STRINGS), /const\s+total\s*=\s*20\s*;/);
});

test('print document escapes markup in the title and the embedded data URL', () => {
  const evilTitle = '</title><script>alert(1)</script>';
  const evilPng = 'data:image/png;base64,QUJD</script><img src=x onerror=alert(1)>';
  const doc = buildPrintDocument(evilPng, 1, { printTitle: evilTitle });

  assert.match(doc, /<title>&lt;\/title&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/title>/);
  assert.ok(doc.includes('\\u003c/script\\u003e\\u003cimg src=x onerror=alert(1)\\u003e'));
  assert.ok(!doc.includes(evilTitle));
  assert.ok(!doc.includes(evilPng));
});

interface FakeImage {
  onerror?: () => void;
}

test('all images failing closes the popup without printing', () => {
  const doc = buildPrintDocument(PNG, 2, STRINGS);
  const script = doc.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);

  const images: FakeImage[] = [];
  const calls = { print: 0, close: 0 };
  const cleanup = () => {
    calls.close += 1;
  };
  const flush = (fn: () => void) => {
    fn();
    return 0;
  };
  vm.runInNewContext(script, {
    document: {
      createElement: () => {
        const img: FakeImage = {};
        images.push(img);
        return img;
      },
      body: { appendChild: () => {} },
    },
    window: {
      print: () => {
        calls.print += 1;
      },
      close: cleanup,
      addEventListener: () => {},
      setTimeout: flush,
      URL: { revokeObjectURL: () => {} },
    },
    URL: { revokeObjectURL: () => {} },
    setTimeout: flush,
  });

  assert.equal(images.length, 2);
  for (const img of images) img.onerror?.();
  assert.equal(calls.print, 0);
  assert.equal(calls.close, 1);
});
