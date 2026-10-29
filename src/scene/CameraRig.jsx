import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Spherical, Vector3 } from 'three';
import gsap from 'gsap';
import { objects } from '../content';
import { useFocus } from '../hooks/useFocus';

// All exploration defaults and limits live here. Angles are in radians.
export const INTERACTION_MODE = 'drag'; // 'drag' | 'follow'
export const CAMERA_FOV = 35;
export const INITIAL_CAMERA_POSITION = [11, 9, 11];
export const INITIAL_DISTANCE = 15;
export const DEFAULT_AZIMUTH = Math.PI / 4;
export const DEFAULT_POLAR = Math.PI / 3;
export const HORIZONTAL_RANGE = 40 * Math.PI / 180;
export const VERTICAL_RANGE = 15 * Math.PI / 180;
export const ROOM_HEIGHT_FRACTION = 0.875;
export const ROOM_WIDTH_FRACTION = 0.94;
export const MIN_DISTANCE_FACTOR = 0.55;
export const MAX_DISTANCE_FACTOR = 1.5;
export const DAMPING_FACTOR = 0.08;
export const FOLLOW_SPEED = 4;
export const FOCUS_SECONDS = 0.8;
export const RETURN_SECONDS = 0.7;
export const MIN_POLAR = Math.max(0.05, DEFAULT_POLAR - VERTICAL_RANGE);
export const MAX_POLAR = Math.min(Math.PI / 2 - 0.05, DEFAULT_POLAR + VERTICAL_RANGE);

function fitRoom(camera, scene, controls) {
  const bounds = new Box3().setFromObject(scene);
  const target = bounds.getCenter(new Vector3());
  const direction = new Vector3().setFromSpherical(new Spherical(1, DEFAULT_POLAR, DEFAULT_AZIMUTH));
  camera.position.copy(target).add(direction);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const tanV = Math.tan(camera.fov * Math.PI / 360);
  const corners = [];
  scene.updateMatrixWorld(true);
  // Per-mesh bounds avoid fitting empty space above the open side of the room.
  scene.traverse((mesh) => {
    if (!mesh.isMesh) return;
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      corners.push(new Vector3(x, y, z).applyMatrix4(mesh.matrixWorld));
    }
  });
  let distance = bounds.getSize(new Vector3()).length() * 2;
  // Recenter projected bounds as distance changes. On narrow phones width wins,
  // keeping the entire room visible rather than cropping it to hit a height goal.
  for (let pass = 0; pass < 8; pass++) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const corner of corners) {
      const offset = corner.clone().sub(target);
      const depth = Math.max(0.1, distance - offset.dot(direction));
      const x = offset.dot(right) / (depth * tanV * camera.aspect);
      const y = offset.dot(up) / (depth * tanV);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    target.addScaledVector(up, (maxY + minY) / 2 * distance * tanV);
    target.addScaledVector(right, (maxX + minX) / 2 * distance * tanV * camera.aspect);
    distance *= Math.max((maxY - minY) / (2 * ROOM_HEIGHT_FRACTION), (maxX - minX) / (2 * ROOM_WIDTH_FRACTION));
  }
  controls.target.copy(target);
  camera.position.copy(target).addScaledVector(direction, distance);
  controls.update();
  return distance;
}

export default function CameraRig({ reducedMotion = false }) {
  const controlsRef = useRef();
  const savedPose = useRef(null);
  const fitted = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const { camera, scene, gl, size } = useThree();
  const { status, objectId, arrived, returned } = useFocus();
  const [distance, setDistance] = useState(INITIAL_DISTANCE);
  const exploring = status === 'exploring';
  const debug = useRef(null);

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    const viewport = size.width + ':' + size.height;
    if (!controls || !exploring || fitted.current === viewport) return;
    const previous = new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const zoomRatio = previous.radius / distance;
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
    const nextDistance = fitRoom(camera, scene, controls);
    if (fitted.current) {
      previous.radius = nextDistance * Math.max(MIN_DISTANCE_FACTOR, Math.min(MAX_DISTANCE_FACTOR, zoomRatio));
      camera.position.copy(controls.target).add(new Vector3().setFromSpherical(previous));
      controls.update();
    }
    setDistance(nextDistance);
    fitted.current = viewport;
  }, [camera, scene, size.width, size.height, exploring]);

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !['focusing', 'returning'].includes(status)) return;
    if (status === 'focusing' && !savedPose.current) {
      savedPose.current = { position: camera.position.clone(), target: controls.target.clone() };
      // Drain OrbitControls' remaining damping without changing the saved view.
      controls.enableDamping = false;
      controls.update();
      camera.position.copy(savedPose.current.position);
      controls.target.copy(savedPose.current.target);
      controls.update();
    }
    const object = objects.find((entry) => entry.id === objectId);
    const pose = status === 'focusing'
      ? { position: new Vector3(...object.focus.cameraPosition), target: new Vector3(...object.focus.lookAt) }
      : savedPose.current;
    if (!pose) { returned(); return; }
    const from = { position: camera.position.clone(), target: controls.target.clone() };
    const mix = { t: 0 };
    const apply = () => {
      camera.position.lerpVectors(from.position, pose.position, mix.t);
      controls.target.lerpVectors(from.target, pose.target, mix.t);
      camera.lookAt(controls.target);
    };
    const finish = () => {
      if (status === 'focusing') arrived(objectId);
      else { savedPose.current = null; returned(); }
    };
    if (reducedMotion) { mix.t = 1; apply(); finish(); return; }
    const tween = gsap.to(mix, {
      t: 1, duration: status === 'focusing' ? FOCUS_SECONDS : RETURN_SECONDS,
      ease: 'power2.inOut', onUpdate: apply, onComplete: finish,
    });
    return () => tween.kill();
  }, [status, objectId, reducedMotion, camera, arrived, returned]);

  useEffect(() => {
    const canvas = gl.domElement;
    const move = (event) => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: (event.clientX - rect.left) / rect.width * 2 - 1, y: (event.clientY - rect.top) / rect.height * 2 - 1 };
    };
    const leave = () => { mouse.current = { x: 0, y: 0 }; };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    return () => { canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); };
  }, [gl]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('debug') !== '1') return;
    const output = document.createElement('textarea');
    output.readOnly = true;
    output.setAttribute('aria-label', 'Camera position and target');
    output.style.cssText = 'position:fixed;bottom:12px;right:12px;width:min(460px,90vw);height:100px;z-index:100;background:#111e;color:white;font:12px monospace;padding:8px;user-select:text;';
    document.body.append(output);
    debug.current = output;
    return () => { debug.current = null; output.remove(); };
  }, []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (exploring && INTERACTION_MODE === 'follow' && !reducedMotion) {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new Spherical().setFromVector3(offset);
      const blend = 1 - Math.exp(-FOLLOW_SPEED * delta);
      spherical.theta += (DEFAULT_AZIMUTH + mouse.current.x * HORIZONTAL_RANGE - spherical.theta) * blend;
      spherical.phi += (DEFAULT_POLAR + mouse.current.y * VERTICAL_RANGE - spherical.phi) * blend;
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
      camera.lookAt(controls.target);
    }
    if (debug.current) {
      const numbers = (v) => v.toArray().map((n) => Number(n.toFixed(3)));
      debug.current.value = `${status}\nfocus: { cameraPosition: [${numbers(camera.position)}], lookAt: [${numbers(controls.target)}] }\nviewport: ${size.width} × ${size.height}`;
    }
  });

  return <OrbitControls ref={controlsRef} makeDefault enabled={exploring}
    enablePan={false} enableRotate={INTERACTION_MODE === 'drag'}
    enableDamping={exploring && !reducedMotion} dampingFactor={DAMPING_FACTOR}
    minAzimuthAngle={exploring ? DEFAULT_AZIMUTH - HORIZONTAL_RANGE : -Infinity}
    maxAzimuthAngle={exploring ? DEFAULT_AZIMUTH + HORIZONTAL_RANGE : Infinity}
    minPolarAngle={exploring ? MIN_POLAR : 0} maxPolarAngle={exploring ? MAX_POLAR : Math.PI}
    minDistance={exploring ? distance * MIN_DISTANCE_FACTOR : 0}
    maxDistance={exploring ? distance * MAX_DISTANCE_FACTOR : Infinity} />;
}
