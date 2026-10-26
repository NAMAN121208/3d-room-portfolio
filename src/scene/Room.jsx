// src/scene/Room.jsx
// Phase 8: Real 3D Room & Props Integration
// - Loads public/models/room.glb (prepared room environment)
// - Loads real prop models from public/models/props/:
//   1. Football (cleats near door on floor)
//   2. Headphones (on desk)
//   3. Sketchbook (on desk)
//   4. Jersey (framed on wall)
//
// Wrapped in groups named exactly: Monitor, Laptop, Bookshelf, Football, Headphones, Sketchbook, Jersey
// These names match `stops` in `src/content.js` for raycasting and click-to-zoom.

import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

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
      {/* 1. ROOM MODEL (contains architecture, desk, sofa, TV, and named groups Monitor, Laptop, Bookshelf) */}
      <primitive
        object={roomScene}
        onPointerOver={handleRoomPointerOver}
        onPointerOut={handleRoomPointerOut}
        onClick={handleRoomClick}
      />

      {/* 2. SKETCHBOOK: placed on free spot on desk [1.4, 1.25, -2.1] */}
      <group
        name="Sketchbook"
        position={[1.4, 1.25, -2.1]}
        rotation={[0, -0.25, 0]}
        {...getInteractiveProps('sketchbook')}
      >
        <primitive
          object={sketchbookScene}
          scale={[0.00055, 0.00055, 0.00055]}
          position={[0.042, 0.003, -0.166]}
        />
      </group>

      {/* 3. HEADPHONES: placed on desk [-0.15, 1.25, -2.0], visible from isometric angle */}
      <group
        name="Headphones"
        position={[-0.15, 1.25, -2.0]}
        rotation={[0, 0.5, 0]}
        {...getInteractiveProps('headphones')}
      >
        <primitive
          object={headphonesScene}
          scale={[0.025, 0.025, 0.025]}
          position={[0, 0.114, 0]}
        />
      </group>

      {/* 4. FOOTBALL (Cleats): placed on floor near door [1.95, 0.20, -2.4] */}
      <group
        name="Football"
        position={[1.95, 0.20, -2.4]}
        rotation={[0, -0.6, 0]}
        {...getInteractiveProps('football')}
      >
        <primitive
          object={footballScene}
          scale={[1.1, 1.1, 1.1]}
          position={[0.03, 0.023, -0.078]}
        />
      </group>

      {/* 5. JERSEY: mounted on wall at [2.4, 2.4, -2.9] */}
      <group
        name="Jersey"
        position={[2.4, 2.4, -2.9]}
        rotation={[0, 0, 0]}
        {...getInteractiveProps('jersey')}
      >
        <primitive
          object={jerseyScene}
          scale={[0.85, 0.85, 0.85]}
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
