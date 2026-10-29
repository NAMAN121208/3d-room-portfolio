// src/scene/ObjectAnchor.jsx
// Tracks the 3D bounding box of the focused object in scene coordinates,
// projects its center and 2D screen extents into pixel space, and signals
// when the camera has completed zooming into the object.

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { stops } from '../content';

export default function ObjectAnchor({ focusedId, onAnchorUpdate }) {
  const { camera, scene, size } = useThree();
  const prevReportRef = useRef(null);
  const zoomTimerRef = useRef(null);
  const isSettledRef = useRef(false);

  // Reset zoom readiness when focused object changes
  useEffect(() => {
    isSettledRef.current = false;
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);

    if (focusedId) {
      // Fallback timer: camera glide takes ~450ms, guaranteed settled by 550ms
      zoomTimerRef.current = setTimeout(() => {
        isSettledRef.current = true;
      }, 550);
    } else {
      onAnchorUpdate?.(null);
    }

    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    };
  }, [focusedId, onAnchorUpdate]);

  useFrame(() => {
    if (!focusedId) {
      if (prevReportRef.current !== null) {
        prevReportRef.current = null;
        onAnchorUpdate?.(null);
      }
      return;
    }

    // 1. Locate the 3D object in the scene hierarchy
    let targetMesh = null;
    const lowerId = focusedId.toLowerCase();

    scene.traverse((obj) => {
      if (targetMesh) return;
      if (obj.name && obj.name.toLowerCase() === lowerId) {
        targetMesh = obj;
      }
    });

    // 2. Compute the 3D bounding box
    const box = new THREE.Box3();
    if (targetMesh) {
      box.setFromObject(targetMesh);
    } else {
      // Fallback using content stop target position
      const stop = stops.find(
        (s) =>
          s.id === lowerId ||
          (s.meshName && s.meshName.toLowerCase() === lowerId)
      );
      const look = stop?.lookAt || [0, 1, 0];
      const pt = new THREE.Vector3(...look);
      box.setFromCenterAndSize(pt, new THREE.Vector3(0.4, 0.4, 0.4));
    }

    const worldCenter = new THREE.Vector3();
    box.getCenter(worldCenter);

    // 3. Project 8 bounding box corners into 2D screen coordinates
    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, box.min.z),
      new THREE.Vector3(box.min.x, box.min.y, box.max.z),
      new THREE.Vector3(box.min.x, box.max.y, box.min.z),
      new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      new THREE.Vector3(box.max.x, box.min.y, box.min.z),
      new THREE.Vector3(box.max.x, box.min.y, box.max.z),
      new THREE.Vector3(box.max.x, box.max.y, box.min.z),
      new THREE.Vector3(box.max.x, box.max.y, box.max.z),
    ];

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < corners.length; i++) {
      corners[i].project(camera);
      const sx = ((corners[i].x + 1) / 2) * size.width;
      const sy = ((-corners[i].y + 1) / 2) * size.height;
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }

    // 4. Project center
    const projCenter = worldCenter.clone().project(camera);
    const screenX = ((projCenter.x + 1) / 2) * size.width;
    const screenY = ((-projCenter.y + 1) / 2) * size.height;

    // 5. Check if camera has reached target stop
    const stop = stops.find(
      (s) =>
        s.id === lowerId ||
        (s.meshName && s.meshName.toLowerCase() === lowerId)
    );

    let isCameraZoomed = isSettledRef.current;
    if (stop && stop.cameraPosition) {
      const targetCam = new THREE.Vector3(...stop.cameraPosition);
      const dist = camera.position.distanceTo(targetCam);
      if (dist < 0.12) {
        isCameraZoomed = true;
        isSettledRef.current = true;
      }
    }

    // Report if values have updated
    const data = {
      x: Math.round(screenX),
      y: Math.round(screenY),
      rect: {
        left: Math.round(minX),
        right: Math.round(maxX),
        top: Math.round(minY),
        bottom: Math.round(maxY),
      },
      isCameraZoomed,
      viewportWidth: Math.round(size.width),
      viewportHeight: Math.round(size.height),
    };

    const prev = prevReportRef.current;
    if (
      !prev ||
      prev.x !== data.x ||
      prev.y !== data.y ||
      prev.rect.left !== data.rect.left ||
      prev.rect.right !== data.rect.right ||
      prev.isCameraZoomed !== data.isCameraZoomed ||
      prev.viewportWidth !== data.viewportWidth ||
      prev.viewportHeight !== data.viewportHeight
    ) {
      prevReportRef.current = data;
      onAnchorUpdate?.(data);
    }
  });

  return null;
}
