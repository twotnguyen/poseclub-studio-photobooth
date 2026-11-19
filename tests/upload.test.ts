import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUploadedShots } from '../src/components/Photobooth/upload.ts';

test('keeps uploaded photos in the order the user selected them', () => {
  assert.deepEqual(buildUploadedShots(['first', 'second', 'third'], 3), ['first', 'second', 'third']);
});

test('rejects too few or too many photos instead of duplicating the first one', () => {
  assert.equal(buildUploadedShots(['first'], 3), null);
  assert.equal(buildUploadedShots(['first', 'second', 'third', 'fourth'], 3), null);
});
