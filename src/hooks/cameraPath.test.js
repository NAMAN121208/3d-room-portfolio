import test from 'node:test';
import assert from 'node:assert/strict';
import { stops } from '../content.js';
import { getScrollSegment, sampleCameraPath } from './cameraPath.js';

test('every exact stop reaches its configured position and target', () => {
  stops.forEach((stop, index) => {
    const pose = sampleCameraPath(stops, index / 7);
    assert.deepEqual(pose.position, stop.cameraPosition);
    assert.deepEqual(pose.lookAt, stop.lookAt);
    assert.equal(pose.activeIndex, index);
  });
});
test('out-of-range and invalid progress stay on valid endpoints', () => {
  for (const progress of [-2, NaN, undefined]) assert.equal(getScrollSegment(progress, 8).from, 0);
  assert.equal(getScrollSegment(2, 8).from, 7);
  assert.equal(getScrollSegment(1, 8).to, 7);
});
test('camera is continuous at boundaries and independent of scroll direction', () => {
  for (let index = 1; index < 7; index++) {
    const before = sampleCameraPath(stops, index / 7 - 1e-7);
    const after = sampleCameraPath(stops, index / 7 + 1e-7);
    for (const key of ['position', 'lookAt']) {
      before[key].forEach((value, axis) => assert.ok(Math.abs(value - after[key][axis]) < 1e-8));
    }
  }
  const forward = Array.from({ length: 101 }, (_, index) => sampleCameraPath(stops, index / 100));
  for (let index = 100; index >= 0; index--) assert.deepEqual(sampleCameraPath(stops, index / 100), forward[index]);
});
test('easing slows at ends without leaving adjacent camera bounds', () => {
  assert.ok(getScrollSegment(0.1 / 7, 8).eased < 0.1);
  assert.ok(getScrollSegment(0.9 / 7, 8).eased > 0.9);
  for (let i = 0; i <= 100; i++) {
    const segment = getScrollSegment(i / 100, 8);
    const pose = sampleCameraPath(stops, i / 100);
    pose.position.forEach((value, axis) => {
      const ends = [stops[segment.from].cameraPosition[axis], stops[segment.to].cameraPosition[axis]];
      assert.ok(value >= Math.min(...ends) - 1e-10 && value <= Math.max(...ends) + 1e-10);
    });
  }
});
test('reduced motion selects whole stops rather than in-between poses', () => {
  for (let i = 0; i <= 100; i++) {
    const pose = sampleCameraPath(stops, i / 100, true);
    assert.deepEqual(pose.position, stops[pose.activeIndex].cameraPosition);
    assert.deepEqual(pose.lookAt, stops[pose.activeIndex].lookAt);
  }
});
test('portrait framing moves back along the same viewing direction', () => {
  const wide = sampleCameraPath(stops, 1 / 7, false, 1.5);
  const portrait = sampleCameraPath(stops, 1 / 7, false, 0.5);
  assert.deepEqual(wide.lookAt, portrait.lookAt);
  wide.position.forEach((value, axis) => assert.ok(Math.abs((portrait.position[axis] - wide.lookAt[axis]) - 2 * (value - wide.lookAt[axis])) < 1e-10));
});
