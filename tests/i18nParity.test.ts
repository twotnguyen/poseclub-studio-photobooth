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

function collectBlankStrings(value: unknown, path: string, blanks: string[]): void {
  if (typeof value === 'string') {
    if (value.trim() === '') blanks.push(path);
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    collectBlankStrings(child, Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`, blanks);
  }
}

const PLACEHOLDER = /\{[^{}]+\}/g;

function placeholderTokens(value: unknown): string[] {
  return typeof value === 'string' ? [...value.matchAll(PLACEHOLDER)].map((match) => match[0]).sort() : [];
}

function assertSamePlaceholders(vi: unknown, en: unknown, path: string): void {
  if (typeof vi !== 'object' || vi === null) {
    assert.deepEqual(placeholderTokens(vi), placeholderTokens(en), `${path}: placeholder tokens differ`);
    return;
  }
  const viRecord = vi as Record<string, unknown>;
  const enRecord = en as Record<string, unknown>;
  for (const [key, child] of Object.entries(viRecord)) {
    assertSamePlaceholders(child, enRecord[key], Array.isArray(vi) ? `${path}[${key}]` : `${path}.${key}`);
  }
}

test('Vietnamese and English translations expose exactly the same keys', () => {
  assertSameShape(TRANSLATIONS.vi, TRANSLATIONS.en, 'TRANSLATIONS');
});

test('no translation string is blank', () => {
  const blanks: string[] = [];
  collectBlankStrings(TRANSLATIONS.vi, 'TRANSLATIONS.vi', blanks);
  collectBlankStrings(TRANSLATIONS.en, 'TRANSLATIONS.en', blanks);
  assert.deepEqual(blanks, [], `blank translation values: ${blanks.join(', ')}`);
});

test('placeholder tokens match between languages at every string path', () => {
  assertSamePlaceholders(TRANSLATIONS.vi, TRANSLATIONS.en, 'TRANSLATIONS');
});

test('booth strings rendered outside the dictionary are translated', () => {
  const keys = ['previousTheme', 'nextTheme', 'printPopupBlocked', 'printDocumentTitle'] as const;
  for (const lang of ['vi', 'en'] as const) {
    const booth = TRANSLATIONS[lang].booth as unknown as Record<string, unknown>;
    for (const key of keys) {
      assert.equal(typeof booth[key], 'string', `${lang}.booth.${key}`);
      assert.ok((booth[key] as string).trim().length > 0, `${lang}.booth.${key} is blank`);
    }
  }
});
