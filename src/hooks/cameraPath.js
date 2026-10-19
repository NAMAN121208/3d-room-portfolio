export function getScrollSegment(progress, count) {
  const clamped = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const scaled = clamped * Math.max(0, count - 1);
  const from = Math.floor(scaled);
  const fraction = scaled - from;
  return {
    from, to: Math.min(from + 1, count - 1), active: Math.round(scaled),
    // Smoothstep slows down at each object without adding time-based camera lag.
    eased: fraction * fraction * (3 - 2 * fraction),
  };
}

export function sampleCameraPath(stops, progress, reducedMotion = false, aspect = 1) {
  const segment = getScrollSegment(progress, stops.length);
  const first = stops[reducedMotion ? segment.active : segment.from];
  const last = stops[reducedMotion ? segment.active : segment.to];
  const mix = (key) => first[key].map((value, axis) => value + (last[key][axis] - value) * segment.eased);
  const lookAt = mix("lookAt");
  const position = mix("cameraPosition");
  // Keep narrow screens from cropping wide objects at the fixed 30-degree FOV.
  const distanceScale = 1 / Math.min(1, Math.max(0.25, aspect));
  return {
    position: distanceScale === 1 ? position : position.map((value, axis) => lookAt[axis] + (value - lookAt[axis]) * distanceScale),
    lookAt, activeIndex: segment.active,
  };
}
