import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from '../src/i18n/translations.ts';

function assertSameShape(vi: unknown, en: unknown, path: string): void {
  assert.equal(Array.isArray(vi), Array.isArray(en), `${path}: array vs non-array`);
  assert.equal(typeof vi === 'object' && vi !== null, typeof en === 'object' && en !== null, `${path}: value kind differs`);

  if (typeof vi !== 'object' || vi === null) {
    assert.equal(typeof vi, typeof en, `${path}: value types differ`);
    return;
  }

  const viRecord = vi as Record<string, unknown>;
  const enRecord = en as Record<string, unknown>;
  const viKeys = Object.keys(viRecord).sort();
  const enKeys = Object.keys(enRecord).sort();
  assert.deepEqual(viKeys, enKeys, `${path}: key sets differ`);
  for (const key of viKeys) {
    assertSameShape(viRecord[key], enRecord[key], `${path}.${key}`);
  }
}

function collectEmptyStrings(value: unknown, path: string, empty: string[]): void {
  if (typeof value === 'string') {
    if (value === '') empty.push(path);
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    collectEmptyStrings(child, Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`, empty);
  }
}

test('Vietnamese and English translations expose exactly the same keys', () => {
  assertSameShape(TRANSLATIONS.vi, TRANSLATIONS.en, 'TRANSLATIONS');
});

test('no translation value is an empty string', () => {
  const empty: string[] = [];
  collectEmptyStrings(TRANSLATIONS.vi, 'TRANSLATIONS.vi', empty);
  collectEmptyStrings(TRANSLATIONS.en, 'TRANSLATIONS.en', empty);
  assert.deepEqual(empty, [], `empty translation values: ${empty.join(', ')}`);
});
