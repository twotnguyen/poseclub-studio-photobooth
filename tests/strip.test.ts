import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRestartCapture, isStripComplete } from '../src/components/Photobooth/strip.ts';

test('shouldRestartCapture only restarts a complete strip without a retake', () => {
  assert.equal(shouldRestartCapture(['a', 'b', 'c'], 3, null), true);
  assert.equal(shouldRestartCapture(['a', '', 'c'], 3, null), false);
  assert.equal(shouldRestartCapture(['a', 'b', 'c'], 3, 0), false);
  assert.equal(shouldRestartCapture(['a', 'b', 'c'], 3, 2), false);
});

test('a strip with one missing shot is incomplete', () => {
  assert.equal(isStripComplete(['a', '', 'c'], 3), false);
});

test('a strip with exactly the required shots is complete', () => {
  assert.equal(isStripComplete(['a', 'b', 'c'], 3), true);
});

test('a short strip is incomplete', () => {
  assert.equal(isStripComplete(['a', 'b'], 3), false);
});

test('extra shots make a strip incomplete', () => {
  assert.equal(isStripComplete(['a', 'b', 'c', 'd'], 3), false);
});

test('a strip with zero slots is never complete', () => {
  assert.equal(isStripComplete([], 0), false);
  assert.equal(isStripComplete(['a'], 0), false);
});

test('a sparse strip with holes is incomplete', () => {
  const shots = new Array<string>(3);
  shots[0] = 'a';
  shots[2] = 'c';
  assert.equal(isStripComplete(shots, 3), false);
});
