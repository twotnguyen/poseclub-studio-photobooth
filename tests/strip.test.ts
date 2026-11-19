import test from 'node:test';
import assert from 'node:assert/strict';
import { isStripComplete } from '../src/components/Photobooth/strip.ts';

test('a strip with one missing shot is incomplete', () => {
  assert.equal(isStripComplete(['a', '', 'c'], 3), false);
});

test('a strip with exactly the required shots is complete', () => {
  assert.equal(isStripComplete(['a', 'b', 'c'], 3), true);
});

test('extra shots do not make a short strip complete', () => {
  assert.equal(isStripComplete(['a', 'b'], 3), false);
});
