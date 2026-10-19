// src/scene/Lights.jsx
// Simple, clean isometric room lighting with ambient fill, key light, and soft accent lighting.
// Tweak the light intensity and positions here to experiment with room mood.

import React from 'react';

export default function Lights() {
  return (
    <>
      {/* Soft ambient light gives the entire room a base illumination so shadows aren't pitch black */}
      <ambientLight intensity={0.8} />

      {/* Main directional key light - simulates sunlight coming in from the open front/side */}
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />

      {/* Secondary fill light - softens contrast on opposite faces */}
      <directionalLight
        position={[-8, 6, -6]}
        intensity={0.4}
        color="#c7d2fe" // subtle cool blue tint
      />

      {/* Warm accent point light near the desk area for cozy interior warmth */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.5}
        distance={10}
        color="#fef08a" // warm amber glow
      />
    </>
  );
}
