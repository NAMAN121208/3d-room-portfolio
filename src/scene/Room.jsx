// src/scene/Room.jsx
// Phase 2 + Phase 8 Polish: Isometric Stylized Room
// Built from geometric primitives with a cozy, warm aesthetic and materials.
// Contains 7 SEPARATELY named interactive meshes with hover highlights and pointer events:
// 1. "Monitor"
// 2. "Laptop"
// 3. "Sketchbook"
// 4. "Headphones"
// 5. "Bookshelf"
// 6. "Jersey"
// 7. "Football"
//
// These names match `stops` in `src/content.js` exactly for raycasting and click-to-zoom.

import React from 'react';

// ============================================================================
// ROOM COLOR PALETTE & MATERIAL CONSTANTS
// Tweak these values to change the room's color scheme, wood tones, and materials.
// ============================================================================
export const ROOM_PALETTE = {
  // 1. Room Architecture
  floor: {
    color: '#854d0e',          // warm honey/walnut hardwood floor
    roughness: 0.55,
    metalness: 0.05,
  },
  rug: {
    baseColor: '#fef3c7',      // cozy warm cream woven rug
    borderColor: '#d97706',    // warm amber decorative border
    roughness: 0.9,
  },
  backWall: {
    color: '#334155',          // cozy slate-navy back wall
    roughness: 0.8,
  },
  leftWall: {
    color: '#2e3b4e',          // deeper complementary slate left wall
    roughness: 0.8,
  },
  baseboards: {
    color: '#1e293b',          // dark architectural skirting trim
    roughness: 0.6,
  },

  // 2. Furniture: Desk & Stool
  desk: {
    topColor: '#a16207',       // warm polished natural oak / teakwood
    topRoughness: 0.45,
    topMetalness: 0.05,
    legsColor: '#27272a',      // matte dark bronze/iron legs
    legsRoughness: 0.35,
    legsMetalness: 0.5,
  },
  chair: {
    seatColor: '#92400e',      // warm saddle-leather stool seat
    seatRoughness: 0.6,
    stemColor: '#71717a',      // brushed metal stem
    stemMetalness: 0.8,
    stemRoughness: 0.25,
    baseColor: '#3f3f46',      // weighted dark cast-iron base
    baseMetalness: 0.6,
  },

  // 3. Interactive Object 1: Monitor (Coding & Skills)
  monitor: {
    frameColor: '#18181b',     // dark matte monitor bezel
    screenColor: '#090d16',    // dark coding IDE background
    screenEmissive: '#1e1b4b', // deep ambient indigo glow
    screenEmissiveIntensity: 0.35,
    standColor: '#3f3f46',     // dark aluminum arm
    standMetalness: 0.7,
    hoverGlow: '#6366f1',      // vibrant indigo hover glow
    hoverIntensity: 0.4,
  },

  // 4. Interactive Object 2: Laptop (Games Played)
  laptop: {
    bodyColor: '#94a3b8',      // space-gray / anodized aluminum chassis
    bodyMetalness: 0.75,
    bodyRoughness: 0.25,
    keyboardColor: '#0f172a',  // deep charcoal keyboard island
    screenColor: '#0284c7',    // bright gaming display
    screenEmissive: '#0369a1',
    screenEmissiveIntensity: 0.25,
    hoverGlow: '#38bdf8',      // electric cyan hover glow
    hoverIntensity: 0.4,
  },

  // 5. Interactive Object 3: Sketchbook (Art Gallery)
  sketchbook: {
    coverColor: '#78350f',     // rich cognac leather sketchbook cover
    coverRoughness: 0.75,
    pagesColor: '#fffbeb',     // warm textured ivory/vellum paper
    pagesRoughness: 0.9,
    pencilColor: '#d97706',    // warm amber artist drawing pencil
    hoverGlow: '#f59e0b',      // golden amber hover glow
    hoverIntensity: 0.4,
  },

  // 6. Interactive Object 4: Headphones (Music / Spotify)
  headphones: {
    bandColor: '#6366f1',      // stylized modern violet-indigo headband
    bandRoughness: 0.3,
    bandMetalness: 0.35,
    cushionColor: '#1e1b4b',   // deep plush velvet ear cushions
    cushionRoughness: 0.75,
    standColor: '#3f3f46',     // sleek metal headphone stand
    standMetalness: 0.7,
    hoverGlow: '#818cf8',      // electric violet hover glow
    hoverIntensity: 0.4,
  },

  // 7. Interactive Object 5: Bookshelf (Reading)
  bookshelf: {
    frameColor: '#5c3214',     // mid-century dark teakwood frame
    innerColor: '#3b1d09',     // shadowed interior alcove
    shelfColor: '#78350f',     // solid wood horizontal shelves
    roughness: 0.55,
    hoverGlow: '#f59e0b',      // warm amber fire glow
    hoverIntensity: 0.3,
    books: [
      '#dc2626',               // crimson red
      '#2563eb',               // royal blue
      '#059669',               // emerald green
      '#d97706',               // warm ochre
      '#7c3aed',               // vibrant violet
      '#ec4899',               // coral pink
    ],
  },

  // 8. Interactive Object 6: Jersey (Football Story)
  jersey: {
    frameBorder: '#d4af37',    // brushed gold/brass frame border
    frameBorderMetalness: 0.8,
    frameBackboard: '#0f172a', // dark museum matting velvet
    shirtMain: '#dc2626',      // classic scarlet match kit
    shirtSleeve: '#b91c1c',    // contrasting darker sleeve fabric
    shirtTrim: '#f8fafc',      // clean white collar & squad number
    hoverGlow: '#ef4444',      // fiery red hover glow
    hoverIntensity: 0.4,
  },

  // 9. Interactive Object 7: Football (Football)
  football: {
    ballColor: '#f8fafc',      // clean white match ball leather
    ballRoughness: 0.35,
    ballMetalness: 0.05,
    bootsColor: '#0284c7',     // royal blue football boots
    bootsRoughness: 0.35,
    hoverGlow: '#10b981',      // emerald pitch hover glow
    hoverIntensity: 0.4,
  },
};

export default function Room({ onSelectObject, hoveredObject, onHoverObject }) {
  // Helper to attach pointer cursor and click handling to interactive targets
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

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. ROOM ARCHITECTURE (Floor & Two Walls for Isometric View) */}
      {/* ========================================================= */}

      {/* Main Floor: y top surface is at y = 0 */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[10, 0.3, 10]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.floor.color}
          roughness={ROOM_PALETTE.floor.roughness}
          metalness={ROOM_PALETTE.floor.metalness}
        />
      </mesh>

      {/* Cozy Decorative Floor Rug with subtle border */}
      <group position={[0.2, 0.01, -0.6]}>
        {/* Main Rug Body */}
        <mesh receiveShadow>
          <boxGeometry args={[5.2, 0.02, 4.2]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.rug.baseColor}
            roughness={ROOM_PALETTE.rug.roughness}
          />
        </mesh>
        {/* Decorative Rug Border Inset */}
        <mesh position={[0, 0.012, 0]} receiveShadow>
          <boxGeometry args={[4.8, 0.005, 3.8]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.rug.borderColor}
            roughness={0.8}
            wireframe={false}
            opacity={0.3}
            transparent
          />
        </mesh>
      </group>

      {/* Back Wall (along X axis at z = -5) */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <boxGeometry args={[10, 6, 0.3]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.backWall.color}
          roughness={ROOM_PALETTE.backWall.roughness}
        />
      </mesh>

      {/* Left Wall (along Z axis at x = -5) */}
      <mesh position={[-5, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 10]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.leftWall.color}
          roughness={ROOM_PALETTE.leftWall.roughness}
        />
      </mesh>

      {/* Baseboards / Skirting */}
      <mesh position={[0, 0.1, -4.85]}>
        <boxGeometry args={[9.7, 0.2, 0.05]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.baseboards.color}
          roughness={ROOM_PALETTE.baseboards.roughness}
        />
      </mesh>
      <mesh position={[-4.85, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 9.7]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.baseboards.color}
          roughness={ROOM_PALETTE.baseboards.roughness}
        />
      </mesh>

      {/* ========================================================= */}
      {/* 2. FURNITURE: DESK & CHAIR */}
      {/* ========================================================= */}

      {/* Desk Top */}
      <mesh position={[0, 1.5, -2.8]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.1, 2.0]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.desk.topColor}
          roughness={ROOM_PALETTE.desk.topRoughness}
          metalness={ROOM_PALETTE.desk.topMetalness}
        />
      </mesh>

      {/* Desk Legs (4 corner supports) */}
      <mesh position={[-2.0, 0.725, -3.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.desk.legsColor}
          metalness={ROOM_PALETTE.desk.legsMetalness}
          roughness={ROOM_PALETTE.desk.legsRoughness}
        />
      </mesh>
      <mesh position={[2.0, 0.725, -3.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.desk.legsColor}
          metalness={ROOM_PALETTE.desk.legsMetalness}
          roughness={ROOM_PALETTE.desk.legsRoughness}
        />
      </mesh>
      <mesh position={[-2.0, 0.725, -2.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.desk.legsColor}
          metalness={ROOM_PALETTE.desk.legsMetalness}
          roughness={ROOM_PALETTE.desk.legsRoughness}
        />
      </mesh>
      <mesh position={[2.0, 0.725, -2.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial
          color={ROOM_PALETTE.desk.legsColor}
          metalness={ROOM_PALETTE.desk.legsMetalness}
          roughness={ROOM_PALETTE.desk.legsRoughness}
        />
      </mesh>

      {/* Minimal Desk Stool / Chair */}
      <group position={[0, 0, -1.3]}>
        {/* Seat */}
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.1, 24]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.chair.seatColor}
            roughness={ROOM_PALETTE.chair.seatRoughness}
          />
        </mesh>
        {/* Central stem */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.chair.stemColor}
            metalness={ROOM_PALETTE.chair.stemMetalness}
            roughness={ROOM_PALETTE.chair.stemRoughness}
          />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 24]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.chair.baseColor}
            metalness={ROOM_PALETTE.chair.baseMetalness}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE OBJECT 1: MONITOR (name="Monitor") */}
      {/* ========================================================= */}
      <group position={[0, 1.55, -3.2]}>
        {/* Monitor Screen - Primary Clickable Target */}
        <mesh
          name="Monitor"
          position={[0, 0.75, 0]}
          castShadow
          receiveShadow
          {...getInteractiveProps('monitor')}
        >
          <boxGeometry args={[1.8, 1.1, 0.08]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.monitor.frameColor}
            roughness={0.3}
            metalness={0.5}
            emissive={hoveredObject === 'monitor' ? ROOM_PALETTE.monitor.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'monitor' ? ROOM_PALETTE.monitor.hoverIntensity : 0}
          />
        </mesh>
        {/* Display Panel Inset */}
        <mesh position={[0, 0.75, 0.045]}>
          <planeGeometry args={[1.68, 0.98]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.monitor.screenColor}
            roughness={0.2}
            emissive={ROOM_PALETTE.monitor.screenEmissive}
            emissiveIntensity={ROOM_PALETTE.monitor.screenEmissiveIntensity}
          />
        </mesh>
        {/* Monitor Stand Vertical Stem */}
        <mesh position={[0, 0.3, -0.05]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.monitor.standColor}
            metalness={ROOM_PALETTE.monitor.standMetalness}
          />
        </mesh>
        {/* Monitor Base Foot */}
        <mesh position={[0, 0.02, 0.05]} receiveShadow>
          <boxGeometry args={[0.6, 0.03, 0.35]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.monitor.standColor}
            metalness={ROOM_PALETTE.monitor.standMetalness}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. INTERACTIVE OBJECT 2: LAPTOP (name="Laptop") */}
      {/* ========================================================= */}
      <group position={[1.4, 1.55, -2.6]} rotation={[0, -0.25, 0]}>
        {/* Laptop Base Body - Primary Clickable Target */}
        <mesh
          name="Laptop"
          position={[0, 0.02, 0]}
          castShadow
          receiveShadow
          {...getInteractiveProps('laptop')}
        >
          <boxGeometry args={[0.7, 0.03, 0.5]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.laptop.bodyColor}
            metalness={ROOM_PALETTE.laptop.bodyMetalness}
            roughness={ROOM_PALETTE.laptop.bodyRoughness}
            emissive={hoveredObject === 'laptop' ? ROOM_PALETTE.laptop.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'laptop' ? ROOM_PALETTE.laptop.hoverIntensity : 0}
          />
        </mesh>
        {/* Keyboard Inset */}
        <mesh position={[0, 0.036, 0.05]}>
          <planeGeometry args={[0.6, 0.3]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color={ROOM_PALETTE.laptop.keyboardColor} roughness={0.8} />
        </mesh>
        {/* Angled Laptop Screen Lid */}
        <group position={[0, 0.03, -0.25]} rotation={[0.25, 0, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.7, 0.45, 0.02]} />
            <meshStandardMaterial
              color={ROOM_PALETTE.laptop.bodyColor}
              metalness={ROOM_PALETTE.laptop.bodyMetalness}
              roughness={ROOM_PALETTE.laptop.bodyRoughness}
            />
          </mesh>
          <mesh position={[0, 0.22, 0.012]}>
            <planeGeometry args={[0.64, 0.4]} />
            <meshStandardMaterial
              color={ROOM_PALETTE.laptop.screenColor}
              emissive={ROOM_PALETTE.laptop.screenEmissive}
              emissiveIntensity={ROOM_PALETTE.laptop.screenEmissiveIntensity}
              roughness={0.3}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE OBJECT 3: SKETCHBOOK (name="Sketchbook") */}
      {/* ========================================================= */}
      <group position={[-1.3, 1.55, -2.5]} rotation={[0, 0.2, 0]}>
        {/* Sketchbook Cover & Block - Primary Clickable Target */}
        <mesh
          name="Sketchbook"
          position={[0, 0.02, 0]}
          castShadow
          receiveShadow
          {...getInteractiveProps('sketchbook')}
        >
          <boxGeometry args={[0.6, 0.04, 0.8]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.sketchbook.coverColor}
            roughness={ROOM_PALETTE.sketchbook.coverRoughness}
            emissive={hoveredObject === 'sketchbook' ? ROOM_PALETTE.sketchbook.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'sketchbook' ? ROOM_PALETTE.sketchbook.hoverIntensity : 0}
          />
        </mesh>
        {/* Paper Pages Inset */}
        <mesh position={[0.02, 0.042, 0]}>
          <boxGeometry args={[0.54, 0.01, 0.74]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.sketchbook.pagesColor}
            roughness={ROOM_PALETTE.sketchbook.pagesRoughness}
          />
        </mesh>
        {/* Drawing Pencil next to sketchbook */}
        <mesh position={[0.38, 0.015, 0]} rotation={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.65, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={ROOM_PALETTE.sketchbook.pencilColor} roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE OBJECT 4: HEADPHONES (name="Headphones") */}
      {/* ========================================================= */}
      <group position={[1.85, 1.55, -3.2]}>
        {/* Headphone Stand Base */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.headphones.standColor}
            metalness={ROOM_PALETTE.headphones.standMetalness}
          />
        </mesh>
        {/* Headphone Stand Pole */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.65, 12]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.headphones.standColor}
            metalness={ROOM_PALETTE.headphones.standMetalness}
          />
        </mesh>
        {/* Headphones Headband Arc - Primary Clickable Target */}
        <mesh
          name="Headphones"
          position={[0, 0.62, 0]}
          castShadow
          receiveShadow
          {...getInteractiveProps('headphones')}
        >
          <torusGeometry args={[0.16, 0.025, 12, 24, Math.PI]} rotation={[0, 0, 0]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.headphones.bandColor}
            metalness={ROOM_PALETTE.headphones.bandMetalness}
            roughness={ROOM_PALETTE.headphones.bandRoughness}
            emissive={hoveredObject === 'headphones' ? ROOM_PALETTE.headphones.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'headphones' ? ROOM_PALETTE.headphones.hoverIntensity : 0}
          />
        </mesh>
        {/* Left Ear Cushion */}
        <mesh position={[-0.16, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.headphones.cushionColor}
            roughness={ROOM_PALETTE.headphones.cushionRoughness}
          />
        </mesh>
        {/* Right Ear Cushion */}
        <mesh position={[0.16, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.headphones.cushionColor}
            roughness={ROOM_PALETTE.headphones.cushionRoughness}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 7. INTERACTIVE OBJECT 5: BOOKSHELF (name="Bookshelf") */}
      {/* ========================================================= */}
      <group position={[-4.3, 0, -1.0]}>
        {/* Outer Wooden Bookshelf Frame - Primary Clickable Target */}
        <mesh
          name="Bookshelf"
          position={[0, 2.1, 0]}
          castShadow
          receiveShadow
          {...getInteractiveProps('bookshelf')}
        >
          <boxGeometry args={[0.8, 4.2, 2.2]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.bookshelf.frameColor}
            roughness={ROOM_PALETTE.bookshelf.roughness}
            emissive={hoveredObject === 'bookshelf' ? ROOM_PALETTE.bookshelf.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'bookshelf' ? ROOM_PALETTE.bookshelf.hoverIntensity : 0}
          />
        </mesh>

        {/* Shelving Inset Compartment (hollow interior) */}
        <mesh position={[0.05, 2.1, 0]}>
          <boxGeometry args={[0.72, 4.0, 2.05]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.bookshelf.innerColor}
            roughness={ROOM_PALETTE.bookshelf.roughness}
          />
        </mesh>

        {/* Individual Horizontal Shelves */}
        <mesh position={[0.05, 1.1, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.06, 2.0]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.shelfColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 2.1, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.06, 2.0]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.shelfColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 3.1, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.06, 2.0]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.shelfColor} roughness={0.6} />
        </mesh>

        {/* Decorative Books on Shelves */}
        <mesh position={[0.05, 1.4, -0.6]} castShadow>
          <boxGeometry args={[0.45, 0.55, 0.12]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.books[0]} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 1.38, -0.45]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.14]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.books[1]} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 1.42, -0.28]} castShadow>
          <boxGeometry args={[0.45, 0.58, 0.16]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.books[2]} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 1.35, -0.1]} castShadow>
          <boxGeometry args={[0.45, 0.46, 0.14]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.books[3]} roughness={0.5} />
        </mesh>

        <mesh position={[0.05, 2.38, 0.2]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.2]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.books[4]} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 2.42, 0.45]} castShadow>
          <boxGeometry args={[0.45, 0.58, 0.22]} />
          <meshStandardMaterial color={ROOM_PALETTE.bookshelf.books[5]} roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 8. INTERACTIVE OBJECT 6: JERSEY (name="Jersey") */}
      {/* ========================================================= */}
      <group position={[2.6, 3.8, -4.82]}>
        {/* Framed Jersey Background Board */}
        <mesh position={[0, 0, -0.02]} receiveShadow>
          <boxGeometry args={[1.5, 1.8, 0.05]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.jersey.frameBackboard}
            roughness={0.8}
          />
        </mesh>
        {/* Frame Border */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[1.56, 1.86, 0.04]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.jersey.frameBorder}
            metalness={ROOM_PALETTE.jersey.frameBorderMetalness}
            roughness={0.3}
          />
        </mesh>
        {/* Jersey Main Body - Primary Clickable Target */}
        <mesh
          name="Jersey"
          position={[0, -0.1, 0.03]}
          castShadow
          {...getInteractiveProps('jersey')}
        >
          <boxGeometry args={[0.9, 1.1, 0.04]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.jersey.shirtMain}
            roughness={0.65}
            emissive={hoveredObject === 'jersey' ? ROOM_PALETTE.jersey.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'jersey' ? ROOM_PALETTE.jersey.hoverIntensity : 0}
          />
        </mesh>
        {/* Left Sleeve */}
        <mesh position={[-0.56, 0.28, 0.03]} rotation={[0, 0, -0.45]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.04]} />
          <meshStandardMaterial color={ROOM_PALETTE.jersey.shirtSleeve} roughness={0.65} />
        </mesh>
        {/* Right Sleeve */}
        <mesh position={[0.56, 0.28, 0.03]} rotation={[0, 0, 0.45]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.04]} />
          <meshStandardMaterial color={ROOM_PALETTE.jersey.shirtSleeve} roughness={0.65} />
        </mesh>
        {/* Jersey Collar / Number Accent */}
        <mesh position={[0, 0.4, 0.055]}>
          <boxGeometry args={[0.25, 0.1, 0.01]} />
          <meshStandardMaterial color={ROOM_PALETTE.jersey.shirtTrim} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.05, 0.055]}>
          <boxGeometry args={[0.3, 0.35, 0.01]} />
          <meshStandardMaterial color={ROOM_PALETTE.jersey.shirtTrim} roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 9. INTERACTIVE OBJECT 7: FOOTBALL (name="Football") */}
      {/* ========================================================= */}
      <group position={[2.6, 0, 1.6]}>
        {/* Football Sphere - Primary Clickable Target */}
        <mesh
          name="Football"
          position={[0, 0.35, 0]}
          castShadow
          receiveShadow
          {...getInteractiveProps('football')}
        >
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.football.ballColor}
            roughness={ROOM_PALETTE.football.ballRoughness}
            metalness={ROOM_PALETTE.football.ballMetalness}
            emissive={hoveredObject === 'football' ? ROOM_PALETTE.football.hoverGlow : '#000000'}
            emissiveIntensity={hoveredObject === 'football' ? ROOM_PALETTE.football.hoverIntensity : 0}
          />
        </mesh>

        {/* Stylized Football Boots resting next to the ball */}
        <mesh position={[-0.45, 0.1, 0.15]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, 0.42]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.football.bootsColor}
            roughness={ROOM_PALETTE.football.bootsRoughness}
          />
        </mesh>
        <mesh position={[-0.2, 0.1, 0.35]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, 0.42]} />
          <meshStandardMaterial
            color={ROOM_PALETTE.football.bootsColor}
            roughness={ROOM_PALETTE.football.bootsRoughness}
          />
        </mesh>
      </group>
    </group>
  );
}
