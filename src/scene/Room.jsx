// src/scene/Room.jsx
// Phase 8: Real Room Environment & Calibrated Prop Placements
// Loads:
// - public/models/room.glb (cleaned room with named groups: Monitor, Laptop, Bookshelf)
// - public/models/props/headphones.glb (JBL headphones on custom stand)
// - public/models/props/sketchbook.glb (open sketchbook on coffee table)
// - public/models/props/football.glb (cleats on floor near door + patterned football sphere)
// - public/models/props/jersey.glb (framed jersey on wall)

import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// ============================================================================
// PROP PLACEMENTS CONFIGURATION
// World coordinates (Y up): floor top y=0.20, desk top y=1.24, coffee table y=0.56.
// Tweak positions [x, y, z], rotationY (radians), and scales per prop here.
// ============================================================================
export const PROP_PLACEMENTS = {
  headphones: {
    // Left end of desk: x=-2.60, z=-1.90, desk top y=1.24
    // Sits in front of left monitor, left of keyboard (x=-2.47), in front of speaker (z=-2.18)
    position: [-2.60, 1.24, -1.90],
    rotationY: 0.65, // angled towards +x, +z to face isometric camera
    scale: 0.046,    // total height ~0.47 including stand (target ~0.5, footprint <= 0.28)
    stand: {
      baseRadius: 0.08,
      baseHeight: 0.015,
      poleRadius: 0.009,
      poleHeight: 0.44,
      color: '#27272a',
      metalness: 0.8,
      roughness: 0.25,
    },
  },
  sketchbook: {
    // Coffee table center: x=0.60, z=1.30, table top y=0.56 (table spans x: 0.26..1.04, z: 0.89..1.87)
    position: [0.60, 0.56, 1.30],
    rotationY: (25 * Math.PI) / 180, // ~25 degrees rotated around Y
    scale: [0.00039, 0.00052, 0.00042], // target bounds: ~0.45 x 0.06 x 0.32
    // Bottom pivot offset so lowest point rests flush on table surface
    modelOffset: [0.030, 0.0025, -0.127],
  },
  football: {
    // Floor near door where slippers were: x=1.75, z=-2.35, floor y=0.20
    boots: {
      position: [1.75, 0.20, -2.35],
      rotationY: (-35 * Math.PI) / 180, // toes pointing away from back wall, slightly angled
      scale: 1.10, // length ~0.45
      modelOffset: [0.03, 0.023, -0.078],
    },
    ball: {
      position: [2.30, 0.20 + 0.175, -2.20], // resting on floor at y = 0.20 + radius (0.175)
      radius: 0.175, // 0.35m diameter
    },
  },
  jersey: {
    // Preserved wall mount: back wall at [2.40, 2.40, -2.90]
    position: [2.40, 2.40, -2.90],
    rotationY: 0,
    scale: 0.85,
  },
};

export default function Room({ onSelectObject, hoveredObject, onHoverObject }) {
  // Load room model and prop models
  const { scene: roomScene } = useGLTF('/models/room.glb');
  const { scene: footballRaw } = useGLTF('/models/props/football.glb');
  const { scene: headphonesRaw } = useGLTF('/models/props/headphones.glb');
  const { scene: sketchbookRaw } = useGLTF('/models/props/sketchbook.glb');
  const { scene: jerseyRaw } = useGLTF('/models/props/jersey.glb');

  // Clone scenes so each instance retains independent transforms and state
  const footballScene = useMemo(() => footballRaw.clone(true), [footballRaw]);
  const headphonesScene = useMemo(() => headphonesRaw.clone(true), [headphonesRaw]);
  const sketchbookScene = useMemo(() => sketchbookRaw.clone(true), [sketchbookRaw]);
  const jerseyScene = useMemo(() => jerseyRaw.clone(true), [jerseyRaw]);

  // Procedural classic soccer ball texture
  const footballTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base leather
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);

    // Black pentagonal panels
    ctx.fillStyle = '#0f172a';
    const patches = [
      [128, 64], [384, 64], [256, 128], [128, 192], [384, 192],
      [0, 128], [512, 128],
    ];

    for (const [x, y] of patches) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = x + 24 * Math.cos(angle);
        const py = y + 24 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Enable shadow casting and receiving across all meshes in the scene
  useEffect(() => {
    [roomScene, footballScene, headphonesScene, sketchbookScene, jerseyScene].forEach((scene) => {
      scene?.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    });
  }, [roomScene, footballScene, headphonesScene, sketchbookScene, jerseyScene]);

  // Helper to attach pointer cursor and click handling to interactive prop targets
  const getInteractiveProps = (id) => ({
    onPointerOver: (e) => {
      e.stopPropagation();
      onHoverObject?.(id);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: (e) => {
      e.stopPropagation();
      onHoverObject?.(null);
      document.body.style.cursor = 'auto';
    },
    onClick: (e) => {
      e.stopPropagation();
      onSelectObject?.(id);
    },
  });

  // Handle pointer interactions on the room model's embedded groups (Monitor, Laptop, Bookshelf)
  const handleRoomPointerOver = (e) => {
    e.stopPropagation();
    let curr = e.object;
    while (curr && curr !== roomScene) {
      const lower = curr.name?.toLowerCase();
      if (lower === 'monitor' || lower === 'laptop' || lower === 'bookshelf') {
        onHoverObject?.(lower);
        document.body.style.cursor = 'pointer';
        return;
      }
      curr = curr.parent;
    }
  };

  const handleRoomPointerOut = (e) => {
    e.stopPropagation();
    onHoverObject?.(null);
    document.body.style.cursor = 'auto';
  };

  const handleRoomClick = (e) => {
    e.stopPropagation();
    let curr = e.object;
    while (curr && curr !== roomScene) {
      const lower = curr.name?.toLowerCase();
      if (lower === 'monitor' || lower === 'laptop' || lower === 'bookshelf') {
        onSelectObject?.(lower);
        return;
      }
      curr = curr.parent;
    }
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ROOM MODEL (architecture, desk, sofa, TV, and named groups Monitor, Laptop, Bookshelf) */}
      <primitive
        object={roomScene}
        onPointerOver={handleRoomPointerOver}
        onPointerOut={handleRoomPointerOut}
        onClick={handleRoomClick}
      />

      {/* 2. HEADPHONES (on stand at left end of desk) */}
      <group
        name="Headphones"
        position={PROP_PLACEMENTS.headphones.position}
        rotation={[0, PROP_PLACEMENTS.headphones.rotationY, 0]}
        {...getInteractiveProps('headphones')}
      >
        {/* Minimalist Stand Base */}
        <mesh
          position={[0, PROP_PLACEMENTS.headphones.stand.baseHeight / 2, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry
            args={[
              PROP_PLACEMENTS.headphones.stand.baseRadius,
              PROP_PLACEMENTS.headphones.stand.baseRadius * 1.05,
              PROP_PLACEMENTS.headphones.stand.baseHeight,
              24,
            ]}
          />
          <meshStandardMaterial
            color={PROP_PLACEMENTS.headphones.stand.color}
            metalness={PROP_PLACEMENTS.headphones.stand.metalness}
            roughness={PROP_PLACEMENTS.headphones.stand.roughness}
          />
        </mesh>

        {/* Stand Vertical Stem */}
        <mesh
          position={[
            0,
            PROP_PLACEMENTS.headphones.stand.poleHeight / 2 + PROP_PLACEMENTS.headphones.stand.baseHeight,
            0,
          ]}
          castShadow
        >
          <cylinderGeometry
            args={[
              PROP_PLACEMENTS.headphones.stand.poleRadius,
              PROP_PLACEMENTS.headphones.stand.poleRadius,
              PROP_PLACEMENTS.headphones.stand.poleHeight,
              16,
            ]}
          />
          <meshStandardMaterial
            color={PROP_PLACEMENTS.headphones.stand.color}
            metalness={PROP_PLACEMENTS.headphones.stand.metalness}
            roughness={PROP_PLACEMENTS.headphones.stand.roughness}
          />
        </mesh>

        {/* Stand Top Cradle Crossbar */}
        <mesh
          position={[
            0,
            PROP_PLACEMENTS.headphones.stand.poleHeight + PROP_PLACEMENTS.headphones.stand.baseHeight,
            0,
          ]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.012, 0.012, 0.12, 16]} />
          <meshStandardMaterial
            color={PROP_PLACEMENTS.headphones.stand.color}
            metalness={PROP_PLACEMENTS.headphones.stand.metalness}
            roughness={PROP_PLACEMENTS.headphones.stand.roughness}
          />
        </mesh>

        {/* JBL Headphones Model hanging on stand */}
        <primitive
          object={headphonesScene}
          scale={[
            PROP_PLACEMENTS.headphones.scale,
            PROP_PLACEMENTS.headphones.scale,
            PROP_PLACEMENTS.headphones.scale,
          ]}
          position={[0, 0.27, 0]}
        />
      </group>

      {/* 3. SKETCHBOOK (on coffee table in room center) */}
      <group
        name="Sketchbook"
        position={PROP_PLACEMENTS.sketchbook.position}
        rotation={[0, PROP_PLACEMENTS.sketchbook.rotationY, 0]}
        {...getInteractiveProps('sketchbook')}
      >
        <primitive
          object={sketchbookScene}
          scale={PROP_PLACEMENTS.sketchbook.scale}
          position={PROP_PLACEMENTS.sketchbook.modelOffset}
        />
      </group>

      {/* 4. FOOTBALL (Cleats + Ball on floor near door) */}
      <group
        name="Football"
        {...getInteractiveProps('football')}
      >
        {/* Boots / Cleats */}
        <group
          position={PROP_PLACEMENTS.football.boots.position}
          rotation={[0, PROP_PLACEMENTS.football.boots.rotationY, 0]}
        >
          <primitive
            object={footballScene}
            scale={[
              PROP_PLACEMENTS.football.boots.scale,
              PROP_PLACEMENTS.football.boots.scale,
              PROP_PLACEMENTS.football.boots.scale,
            ]}
            position={PROP_PLACEMENTS.football.boots.modelOffset}
          />
        </group>

        {/* Football Sphere resting on floor */}
        <mesh
          position={PROP_PLACEMENTS.football.ball.position}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[PROP_PLACEMENTS.football.ball.radius, 32, 32]} />
          <meshStandardMaterial
            map={footballTexture}
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* 5. JERSEY (Framed wall kit) */}
      <group
        name="Jersey"
        position={PROP_PLACEMENTS.jersey.position}
        rotation={[0, PROP_PLACEMENTS.jersey.rotationY, 0]}
        {...getInteractiveProps('jersey')}
      >
        <primitive
          object={jerseyScene}
          scale={[
            PROP_PLACEMENTS.jersey.scale,
            PROP_PLACEMENTS.jersey.scale,
            PROP_PLACEMENTS.jersey.scale,
          ]}
        />
      </group>
    </group>
  );
}

// Preload models for instantaneous rendering
useGLTF.preload('/models/room.glb');
useGLTF.preload('/models/props/football.glb');
useGLTF.preload('/models/props/headphones.glb');
useGLTF.preload('/models/props/sketchbook.glb');
useGLTF.preload('/models/props/jersey.glb');
