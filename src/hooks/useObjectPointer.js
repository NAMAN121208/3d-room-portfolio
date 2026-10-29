import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { objects } from '../content';
import { useFocus } from './useFocus';
import { CLICK_DISTANCE_PX, highlightGroup, isClick, resolveObject } from './objectTargets';
import { validateContent, validateSceneMeshes } from '../utils/validateContent';

export function useObjectPointer() {
  const { status, focus } = useFocus();
  const { gl, scene, events } = useThree();
  const pressed = useRef(null);
  const hover = useRef(null);
  const undo = useRef(() => {});
  const setHover = (group) => {
    if (hover.current === group) return;
    undo.current();
    hover.current = group;
    undo.current = group ? highlightGroup(group) : () => {};
    gl.domElement.style.cursor = group ? 'pointer' : status === 'exploring' ? 'grab' : 'default';
  };
  useEffect(() => {
    validateContent(objects);
    validateSceneMeshes(objects, scene);
    const canvas = gl.domElement;
    const move = (event) => {
      const start = pressed.current;
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_DISTANCE_PX) start.dragged = true;
    };
    // Multi-touch gestures can never become an object tap on release.
    const down = (event) => { if (!event.isPrimary) pressed.current = null; };
    const cancel = () => { pressed.current = null; setHover(null); };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointercancel', cancel);
    canvas.addEventListener('pointerleave', cancel);
    return () => {
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('pointerleave', cancel);
      undo.current();
      hover.current = null;
      canvas.style.cursor = '';
    };
  }, [gl, scene]);
  useEffect(() => {
    setHover(null);
    pressed.current = null;
    gl.domElement.style.cursor = status === 'exploring' ? 'grab' : 'default';
  }, [status, gl]);
  // Keep the highlight accurate when damping moves geometry under the pointer.
  useFrame(() => { if (status === 'exploring') events.update?.(); });
  const resolve = (event) => {
    event.stopPropagation();
    // HTML panels are siblings of Canvas. Also reject any forwarded DOM events.
    if (status !== 'exploring' || event.nativeEvent.target !== gl.domElement) return null;
    return resolveObject(event.intersections, objects);
  };
  return {
    onPointerMove(event) {
      const target = resolve(event);
      setHover(event.pointerType === 'touch' ? null : target?.group ?? null);
    },
    onPointerOut() { setHover(null); },
    onPointerDown(event) {
      const target = resolve(event);
      pressed.current = event.isPrimary && event.button === 0 && target
        ? { id: target.object.id, x: event.clientX, y: event.clientY, pointerId: event.pointerId, dragged: false } : null;
    },
    onPointerUp(event) {
      const start = pressed.current;
      pressed.current = null;
      const target = resolve(event);
      if (target && target.object.id === start?.id && isClick(start, event)) {
        setHover(null);
        focus(target.object.id);
      }
    },
  };
}
