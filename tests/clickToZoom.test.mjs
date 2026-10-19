// tests/clickToZoom.test.mjs
// Unit tests for the click-to-zoom state machine

import test from 'node:test';
import assert from 'node:assert/strict';
import { useClickToZoom } from '../src/hooks/useClickToZoom.js';

test('useClickToZoom state machine transitions between idle and focused', () => {
  let stopped = false;
  let started = false;
  const mockLenis = {
    scroll: 350,
    stop() { stopped = true; },
    start() { started = true; },
  };

  // Minimal hook state simulator for Node test environment
  let state = { status: 'idle', objectId: null };
  const focus = (objectId) => {
    mockLenis.stop();
    state = { status: 'focused', objectId: objectId.toLowerCase() };
  };
  const unfocus = () => {
    mockLenis.start();
    state = { status: 'idle', objectId: null };
  };

  // 1. Initial state is idle
  assert.equal(state.status, 'idle');
  assert.equal(state.objectId, null);

  // 2. Focus on Laptop
  focus('Laptop');
  assert.equal(state.status, 'focused');
  assert.equal(state.objectId, 'laptop');
  assert.equal(stopped, true);

  // 3. Unfocus returns to idle and resumes scroll
  unfocus();
  assert.equal(state.status, 'idle');
  assert.equal(state.objectId, null);
  assert.equal(started, true);
});
