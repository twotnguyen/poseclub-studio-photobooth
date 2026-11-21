import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUploadedShots } from '../src/components/Photobooth/upload.ts';

const PNG = 'data:image/png;base64,QUJD';
const JPEG = 'data:image/jpeg;base64,QUJD';

test('keeps uploaded photos in the order the user selected them', () => {
  assert.deepEqual(buildUploadedShots([PNG, JPEG, PNG], 3), [PNG, JPEG, PNG]);
});

test('returns a copy so caller mutations cannot change the upload buffer', () => {
  const input = [PNG, JPEG, PNG];
  const result = buildUploadedShots(input, 3);

  assert.ok(result);
  assert.notEqual(result, input);
  input[0] = JPEG;
  assert.equal(result[0], PNG);
});

test('rejects too few or too many photos instead of duplicating the first one', () => {
  assert.equal(buildUploadedShots([PNG], 3), null);
  assert.equal(buildUploadedShots([PNG, JPEG, PNG, JPEG], 3), null);
});

test('rejects empty, corrupt, and non-image data URLs', () => {
  assert.equal(buildUploadedShots([''], 1), null);
  assert.equal(buildUploadedShots(['first'], 1), null);
  assert.equal(buildUploadedShots(['data:image/png;base64,'], 1), null);
  assert.equal(buildUploadedShots(['data:image/png;base64,A'], 1), null);
  assert.equal(buildUploadedShots(['data:image/png;base64,AB=C'], 1), null);
  assert.equal(buildUploadedShots(['data:image/png;base64,!!!'], 1), null);
  assert.equal(buildUploadedShots(['data:text/plain;base64,QUJD'], 1), null);
  assert.equal(buildUploadedShots([PNG, 'data:image/png;base64,', PNG], 3), null);
});
