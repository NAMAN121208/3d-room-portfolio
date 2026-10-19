import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { stops } from '../content';
import { getScrollSegment, sampleCameraPath } from '../hooks/cameraPath';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useCameraDebug } from '../hooks/useCameraDebug';

export default function CameraRig({ lenis, reducedMotion = false }) {
  const progress = useScrollProgress(lenis);
  const { camera, gl, size } = useThree();
  const activeIndex = getScrollSegment(progress, stops.length).active;
  const previousStop = useRef(null);
  const aspect = size.width / Math.max(1, size.height);
  useCameraDebug(gl.domElement, stops[activeIndex].id, progress, reducedMotion);

  useFrame(() => {
    if (reducedMotion) return;
    const pose = sampleCameraPath(stops, progress, false, aspect);
    camera.position.set(...pose.position);
    camera.lookAt(...pose.lookAt);
  });

  useLayoutEffect(() => {
    if (!reducedMotion) { previousStop.current = null; return; }
    const applyStop = () => {
      const pose = sampleCameraPath(stops, activeIndex / (stops.length - 1), true, aspect);
      camera.position.set(...pose.position);
      camera.lookAt(...pose.lookAt);
    };
    const canvas = gl.domElement;
    const oldOpacity = canvas.style.opacity;
    // Move only while the canvas is hidden: no travel animation in reduced mode.
    if (previousStop.current === null || previousStop.current === activeIndex) {
      applyStop();
      previousStop.current = activeIndex;
      return;
    }
    previousStop.current = activeIndex;
    const fade = gsap.timeline()
      .to(canvas, { opacity: 0, duration: 0.06 })
      .call(applyStop)
      .to(canvas, { opacity: 1, duration: 0.09 });
    return () => { fade.kill(); canvas.style.opacity = oldOpacity; };
  }, [activeIndex, aspect, camera, gl, reducedMotion]);

  return null;
}
