// src/scene/CameraRig.jsx
// Scroll-driven camera rig and click-to-zoom state machine interpolation
// Supports:
// - idle: scroll progress samples smooth path between stops
// - focused(objectId): camera glides smoothly to the object's stop coordinates
// - prefers-reduced-motion: clean fades instead of movement animations

import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { stops } from '../content';
import { getScrollSegment, sampleCameraPath } from '../hooks/cameraPath';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useCameraDebug } from '../hooks/useCameraDebug';

export default function CameraRig({ lenis, reducedMotion = false, focusedId = null }) {
  const progress = useScrollProgress(lenis);
  const { camera, gl, size } = useThree();
  const activeIndex = getScrollSegment(progress, stops.length).active;
  const previousStop = useRef(null);
  const currentLookAt = useRef(null);
  const aspect = size.width / Math.max(1, size.height);

  const focusedStop = focusedId
    ? stops.find(
        (s) =>
          s.id === focusedId ||
          (s.meshName && s.meshName.toLowerCase() === focusedId.toLowerCase())
      )
    : null;

  useCameraDebug(
    gl.domElement,
    focusedStop ? focusedStop.id : stops[activeIndex].id,
    progress,
    reducedMotion
  );

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (focusedStop) {
      // Interpolate camera to the focused object's camera position & lookAt
      const targetPos = new THREE.Vector3(...focusedStop.cameraPosition);
      const targetLook = new THREE.Vector3(...focusedStop.lookAt);

      if (!currentLookAt.current) {
        currentLookAt.current = targetLook.clone();
      }

      // Smooth damped glide
      const t = Math.min(1, delta * 4.5);
      camera.position.lerp(targetPos, t);
      currentLookAt.current.lerp(targetLook, t);
      camera.lookAt(currentLookAt.current);
    } else {
      // In idle state, scroll drives camera along path
      const pose = sampleCameraPath(stops, progress, false, aspect);
      const targetPos = new THREE.Vector3(...pose.position);
      const targetLook = new THREE.Vector3(...pose.lookAt);

      if (!currentLookAt.current) {
        currentLookAt.current = targetLook.clone();
      }

      // Smooth transition back to scroll pose after closing
      const t = Math.min(1, delta * 5.0);
      camera.position.lerp(targetPos, t);
      currentLookAt.current.lerp(targetLook, t);
      camera.lookAt(currentLookAt.current);
    }
  });

  useLayoutEffect(() => {
    if (!reducedMotion) {
      previousStop.current = null;
      return;
    }

    const applyStop = () => {
      if (focusedStop) {
        camera.position.set(...focusedStop.cameraPosition);
        camera.lookAt(...focusedStop.lookAt);
      } else {
        const pose = sampleCameraPath(stops, activeIndex / (stops.length - 1), true, aspect);
        camera.position.set(...pose.position);
        camera.lookAt(...pose.lookAt);
      }
    };

    const canvas = gl.domElement;
    const oldOpacity = canvas.style.opacity;

    // In reduced mode, fade canvas quickly to avoid camera travel
    const fade = gsap.timeline()
      .to(canvas, { opacity: 0, duration: 0.06 })
      .call(applyStop)
      .to(canvas, { opacity: 1, duration: 0.09 });

    return () => {
      fade.kill();
      canvas.style.opacity = oldOpacity;
    };
  }, [activeIndex, aspect, camera, gl, reducedMotion, focusedStop]);

  return null;
}
