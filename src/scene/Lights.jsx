// src/scene/Lights.jsx
// Cozy, stylized isometric lighting setup for the 3D room.
// Edit these clearly named constants to tweak brightness, colors, and mood.

import React from 'react';

// ============================================================================
// LIGHTING CONFIGURATION CONSTANTS
// Tweak these values to experiment with the room's mood, color temperature, and shadow depth.
// ============================================================================
export const LIGHTING_CONFIG = {
  // 1. Ambient base illumination (soft, warm room fill so shadows aren't harsh)
  ambient: {
    color: '#fff7ed',      // warm cream tint
    intensity: 0.65,
  },

  // 2. Hemisphere environmental bounce (soft sky tint above, warm floor bounce below)
  hemisphere: {
    skyColor: '#e0e7ff',   // soft daylight periwinkle from above
    groundColor: '#78350f',// warm amber-wood bounce from the floor
    intensity: 0.35,
  },

  // 3. Main Key Light (warm golden sunlight casting soft, clean directional shadows)
  keyLight: {
    color: '#fffbeb',      // warm sunlight white-gold
    intensity: 1.35,
    position: [9, 13, 7],  // isometric diagonal sun angle
    shadowMapSize: 2048,   // 2048x2048 provides crisp, clean shadows with 60fps performance
    shadowBias: -0.0004,
  },

  // 4. Fill Light (cool lavender-blue bounce on opposite faces to preserve depth and volume)
  fillLight: {
    color: '#c7d2fe',      // soft lavender-slate fill
    intensity: 0.45,
    position: [-8, 7, -6], // opposite corner to fill deep shadow cavities
  },

  // 5. Cozy Interior Accent / Desk Lamp Light (warm glowing point light near the workspace)
  cozyAccent: {
    color: '#f59e0b',      // warm amber lantern/desk glow
    intensity: 1.0,
    position: [-0.5, 2.8, -2.4], // positioned right above the desk area
    distance: 8.5,
    decay: 2,
  },

  // 6. Subtle Rim / Kick Light (adds crisp separation to object silhouettes against walls)
  rimLight: {
    color: '#93c5fd',      // crisp soft cyan-blue rim
    intensity: 0.3,
    position: [6, 5, -5],
  },
};

export default function Lights() {
  const { ambient, hemisphere, keyLight, fillLight, cozyAccent, rimLight } = LIGHTING_CONFIG;

  return (
    <>
      {/* Soft ambient illumination gives the entire room a luminous base */}
      <ambientLight color={ambient.color} intensity={ambient.intensity} />

      {/* Atmospheric hemisphere light adds natural two-tone vertical gradient */}
      <hemisphereLight
        skyColor={hemisphere.skyColor}
        groundColor={hemisphere.groundColor}
        intensity={hemisphere.intensity}
      />

      {/* Main directional key light - simulates sunlight coming in from the open front/side */}
      <directionalLight
        position={keyLight.position}
        intensity={keyLight.intensity}
        color={keyLight.color}
        castShadow
        shadow-mapSize-width={keyLight.shadowMapSize}
        shadow-mapSize-height={keyLight.shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={keyLight.shadowBias}
      />

      {/* Secondary fill light - softens contrast on opposite faces with a cool tint */}
      <directionalLight
        position={fillLight.position}
        intensity={fillLight.intensity}
        color={fillLight.color}
      />

      {/* Warm accent point light near the desk area for cozy interior warmth */}
      <pointLight
        position={cozyAccent.position}
        intensity={cozyAccent.intensity}
        color={cozyAccent.color}
        distance={cozyAccent.distance}
        decay={cozyAccent.decay}
      />

      {/* Subtle rim light adds crisp edge highlights to furniture and objects */}
      <directionalLight
        position={rimLight.position}
        intensity={rimLight.intensity}
        color={rimLight.color}
      />
    </>
  );
}
