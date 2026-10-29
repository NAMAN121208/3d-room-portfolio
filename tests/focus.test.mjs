import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, MeshStandardMaterial, BoxGeometry } from 'three';
import { focusReducer, initialFocusState } from '../src/hooks/focusReducer.js';
import { resolveObject, highlightGroup, isClick } from '../src/hooks/objectTargets.js';

const focus = (state, id = 'monitor') => focusReducer(state, { type: 'FOCUS', objectId: id });
test('full exploration -> focus -> return lifecycle waits for camera completion', () => {
  const focusing = focus(initialFocusState);
  assert.deepEqual(focusing, { status: 'focusing', objectId: 'monitor' });
  const focused = focusReducer(focusing, { type: 'ARRIVED', objectId: 'monitor' });
  assert.equal(focused.status, 'focused');
  const returning = focusReducer(focused, { type: 'CLOSE' });
  assert.equal(returning.status, 'returning');
  assert.equal(focusReducer(returning, { type: 'RETURNED' }), initialFocusState);
});
test('second clicks cannot retarget any in-progress or focused state', () => {
  for (const status of ['focusing', 'focused', 'returning']) {
    const state = { status, objectId: 'monitor' };
    assert.equal(focus(state, 'laptop'), state);
  }
  assert.equal(focus(initialFocusState, ''), initialFocusState);
  assert.equal(focusReducer(initialFocusState, { type: 'CLOSE' }), initialFocusState);
});
test('Esc may cancel a focus glide; stale completion cannot reopen its panel', () => {
  const state = focus(initialFocusState);
  assert.equal(focusReducer(state, { type: 'ARRIVED', objectId: 'laptop' }), state);
  const returning = focusReducer(state, { type: 'CLOSE' });
  assert.equal(returning.status, 'returning');
  assert.equal(focusReducer(returning, { type: 'ARRIVED', objectId: 'monitor' }), returning);
  assert.equal(focusReducer(state, { type: 'RETURNED' }), state);
});

const objects = [{ id: 'monitor', meshName: 'Monitor' }, { id: 'laptop', meshName: 'Laptop' }];
function fixture() {
  const monitor = new Group(); monitor.name = 'Monitor';
  const nested = new Group(); monitor.add(nested);
  const mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial()); nested.add(mesh);
  return { monitor, nested, mesh };
}
test('parent walk resolves nested children and the nearest exact named ancestor', () => {
  const { monitor, nested, mesh } = fixture();
  assert.equal(resolveObject([{ object: mesh }], objects).group, monitor);
  nested.name = 'Laptop';
  assert.equal(resolveObject([{ object: mesh }], objects).object.id, 'laptop');
  nested.name = 'laptop';
  assert.equal(resolveObject([{ object: mesh }], objects).object.id, 'monitor');
  assert.equal(resolveObject([], objects), null);
});
test('decor in front blocks objects behind it', () => {
  const { mesh } = fixture();
  const decor = new Mesh();
  assert.equal(resolveObject([{ object: decor }, { object: mesh }], objects), null);
});
test('group highlights preserve shared materials and dispose their clones', () => {
  const { monitor, mesh } = fixture();
  const original = mesh.material;
  const other = new Mesh(new BoxGeometry(), original);
  const undo = highlightGroup(monitor);
  const clone = mesh.material;
  let disposed = false;
  clone.addEventListener('dispose', () => { disposed = true; });
  assert.notEqual(clone, original);
  assert.equal(other.material, original);
  assert.equal(original.emissive.getHex(), 0);
  undo();
  assert.equal(mesh.material, original);
  assert.equal(disposed, true);
});
test('4px click threshold excludes drags, returned drags, and other pointers', () => {
  const start = { x: 10, y: 20, pointerId: 1 };
  assert.equal(isClick(start, { clientX: 14, clientY: 20, pointerId: 1 }), true);
  assert.equal(isClick(start, { clientX: 14, clientY: 21, pointerId: 1 }), false);
  assert.equal(isClick({ ...start, dragged: true }, { clientX: 10, clientY: 20, pointerId: 1 }), false);
  assert.equal(isClick(start, { clientX: 10, clientY: 20, pointerId: 2 }), false);
});
