// Only the frontmost intersection counts. Never search later hits for a target.
export function resolveObject(intersections, objects) {
  for (let node = intersections[0]?.object; node; node = node.parent) {
    const object = objects.find((entry) => entry.meshName === node.name);
    if (object) return { object, group: node };
  }
  return null;
}

export function highlightGroup(group) {
  const changed = [];
  group.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.material) return;
    const original = mesh.material;
    const clones = (Array.isArray(original) ? original : [original]).map((material) => {
      const clone = material.clone();
      if (clone.emissive) { clone.emissive.set('#6366f1'); clone.emissiveIntensity = 0.4; }
      else clone.color?.lerp({ r: 0.6, g: 0.6, b: 1 }, 0.25);
      return clone;
    });
    mesh.material = Array.isArray(original) ? clones : clones[0];
    changed.push({ mesh, original, clones });
  });
  return () => changed.forEach(({ mesh, original, clones }) => {
    mesh.material = original;
    clones.forEach((material) => material.dispose());
  });
}

export const CLICK_DISTANCE_PX = 4;
export function isClick(start, event) {
  return !!start && !start.dragged && start.pointerId === event.pointerId
    && Math.hypot(start.x - event.clientX, start.y - event.clientY) <= CLICK_DISTANCE_PX;
}
