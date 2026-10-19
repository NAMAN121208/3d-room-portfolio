// src/scene/Room.jsx
// Phase 2: Isometric Greybox Room
// Built from simple geometric primitives (boxes, cylinders, spheres).
// Contains 7 SEPARATELY named interactive meshes:
// 1. "Monitor"
// 2. "Laptop"
// 3. "Sketchbook"
// 4. "Headphones"
// 5. "Football"
// 6. "Jersey"
// 7. "Bookshelf"
//
// These names match `stops` in `src/content.js` exactly for Codex's Phase 3 & 4 raycasting.

import React from 'react';

export default function Room() {
  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. ROOM ARCHITECTURE (Floor & Two Walls for Isometric View) */}
      {/* ========================================================= */}

      {/* Main Floor: y top surface is at y = 0 */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[10, 0.3, 10]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Cozy Decorative Floor Rug */}
      <mesh position={[0.2, 0.01, -0.6]} receiveShadow>
        <boxGeometry args={[5.2, 0.02, 4.2]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* Back Wall (along X axis at z = -5) */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <boxGeometry args={[10, 6, 0.3]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Left Wall (along Z axis at x = -5) */}
      <mesh position={[-5, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 10]} />
        <meshStandardMaterial color="#3f4e64" roughness={0.8} />
      </mesh>

      {/* Baseboards / Skirting */}
      <mesh position={[0, 0.1, -4.85]}>
        <boxGeometry args={[9.7, 0.2, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-4.85, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 9.7]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* ========================================================= */}
      {/* 2. FURNITURE: DESK & CHAIR */}
      {/* ========================================================= */}

      {/* Desk Top */}
      <mesh position={[0, 1.5, -2.8]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.1, 2.0]} />
        <meshStandardMaterial color="#92400e" roughness={0.5} />
      </mesh>

      {/* Desk Legs (4 corner supports) */}
      <mesh position={[-2.0, 0.725, -3.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[2.0, 0.725, -3.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-2.0, 0.725, -2.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[2.0, 0.725, -2.0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.45, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Minimal Desk Stool / Chair */}
      <group position={[0, 0, -1.3]}>
        {/* Seat */}
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.1, 24]} />
          <meshStandardMaterial color="#18181b" roughness={0.6} />
        </mesh>
        {/* Central stem */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
          <meshStandardMaterial color="#71717a" metalness={0.8} />
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 24]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.7} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE OBJECT 1: MONITOR (name="Monitor") */}
      {/* ========================================================= */}
      <group position={[0, 1.55, -3.2]}>
        {/* Monitor Screen - Primary Clickable Target */}
        <mesh name="Monitor" position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.1, 0.08]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Display Panel Inset (subtle blue glow / code screen preview) */}
        <mesh position={[0, 0.75, 0.045]}>
          <planeGeometry args={[1.68, 0.98]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} emissive="#1e1b4b" emissiveIntensity={0.3} />
        </mesh>
        {/* Monitor Stand Vertical Stem */}
        <mesh position={[0, 0.3, -0.05]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} />
        </mesh>
        {/* Monitor Base Foot */}
        <mesh position={[0, 0.02, 0.05]} receiveShadow>
          <boxGeometry args={[0.6, 0.03, 0.35]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. INTERACTIVE OBJECT 2: LAPTOP (name="Laptop") */}
      {/* ========================================================= */}
      <group position={[1.4, 1.55, -2.6]} rotation={[0, -0.25, 0]}>
        {/* Laptop Base Body - Primary Clickable Target */}
        <mesh name="Laptop" position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.03, 0.5]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Keyboard Inset */}
        <mesh position={[0, 0.036, 0.05]}>
          <planeGeometry args={[0.6, 0.3]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#18181b" roughness={0.8} />
        </mesh>
        {/* Angled Laptop Screen Lid */}
        <group position={[0, 0.03, -0.25]} rotation={[0.25, 0, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.7, 0.45, 0.02]} />
            <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.22, 0.012]}>
            <planeGeometry args={[0.64, 0.4]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.2} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE OBJECT 3: SKETCHBOOK (name="Sketchbook") */}
      {/* ========================================================= */}
      <group position={[-1.3, 1.55, -2.5]} rotation={[0, 0.2, 0]}>
        {/* Sketchbook Cover & Block - Primary Clickable Target */}
        <mesh name="Sketchbook" position={[0, 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.04, 0.8]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Paper Pages Inset */}
        <mesh position={[0.02, 0.042, 0]}>
          <boxGeometry args={[0.54, 0.01, 0.74]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        {/* Drawing Pencil next to sketchbook */}
        <mesh position={[0.38, 0.015, 0]} rotation={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.65, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE OBJECT 4: HEADPHONES (name="Headphones") */}
      {/* ========================================================= */}
      <group position={[1.85, 1.55, -3.2]}>
        {/* Headphone Stand Base */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
          <meshStandardMaterial color="#27272a" metalness={0.6} />
        </mesh>
        {/* Headphone Stand Pole */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.65, 12]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.8} />
        </mesh>
        {/* Headphones Headband Arc - Primary Clickable Target */}
        <mesh name="Headphones" position={[0, 0.62, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.16, 0.025, 12, 24, Math.PI]} rotation={[0, 0, 0]} />
          <meshStandardMaterial color="#4f46e5" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Left Ear Cushion */}
        <mesh position={[-0.16, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.7} />
        </mesh>
        {/* Right Ear Cushion */}
        <mesh position={[0.16, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.7} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 7. INTERACTIVE OBJECT 5: BOOKSHELF (name="Bookshelf") */}
      {/* ========================================================= */}
      <group position={[-4.3, 0, -1.0]}>
        {/* Outer Wooden Bookshelf Frame - Primary Clickable Target */}
        <mesh name="Bookshelf" position={[0, 2.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 4.2, 2.2]} />
          <meshStandardMaterial color="#451a03" roughness={0.6} />
        </mesh>

        {/* Shelving Inset Compartment (hollow interior) */}
        <mesh position={[0.05, 2.1, 0]}>
          <boxGeometry args={[0.72, 4.0, 2.05]} />
          <meshStandardMaterial color="#291205" roughness={0.7} />
        </mesh>

        {/* Individual Horizontal Shelves */}
        <mesh position={[0.05, 1.1, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.06, 2.0]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.05, 2.1, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.06, 2.0]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.05, 3.1, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.06, 2.0]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>

        {/* Decorative Books on Shelves */}
        {/* Shelf 1 books */}
        <mesh position={[0.05, 1.4, -0.6]} castShadow>
          <boxGeometry args={[0.45, 0.55, 0.12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 1.38, -0.45]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.14]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 1.42, -0.28]} castShadow>
          <boxGeometry args={[0.45, 0.58, 0.16]} />
          <meshStandardMaterial color="#10b981" roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 1.35, -0.1]} castShadow>
          <boxGeometry args={[0.45, 0.46, 0.14]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>

        {/* Shelf 2 books */}
        <mesh position={[0.05, 2.38, 0.2]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 2.42, 0.45]} castShadow>
          <boxGeometry args={[0.45, 0.58, 0.22]} />
          <meshStandardMaterial color="#ec4899" roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 8. INTERACTIVE OBJECT 6: JERSEY (name="Jersey") */}
      {/* ========================================================= */}
      <group position={[2.6, 3.8, -4.82]}>
        {/* Framed Jersey Background Board */}
        <mesh position={[0, 0, -0.02]} receiveShadow>
          <boxGeometry args={[1.5, 1.8, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Frame Border */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[1.56, 1.86, 0.04]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Jersey Main Body - Primary Clickable Target */}
        <mesh name="Jersey" position={[0, -0.1, 0.03]} castShadow>
          <boxGeometry args={[0.9, 1.1, 0.04]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
        {/* Left Sleeve */}
        <mesh position={[-0.56, 0.28, 0.03]} rotation={[0, 0, -0.45]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.04]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        {/* Right Sleeve */}
        <mesh position={[0.56, 0.28, 0.03]} rotation={[0, 0, 0.45]} castShadow>
          <boxGeometry args={[0.35, 0.35, 0.04]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        {/* Jersey Collar / Number Accent */}
        <mesh position={[0, 0.4, 0.055]}>
          <boxGeometry args={[0.25, 0.1, 0.01]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.05, 0.055]}>
          <boxGeometry args={[0.3, 0.35, 0.01]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 9. INTERACTIVE OBJECT 7: FOOTBALL (name="Football") */}
      {/* ========================================================= */}
      <group position={[2.6, 0, 1.6]}>
        {/* Football Sphere - Primary Clickable Target */}
        <mesh name="Football" position={[0, 0.35, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Stylized Football Boots resting next to the ball */}
        <mesh position={[-0.45, 0.1, 0.15]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, 0.42]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
        <mesh position={[-0.2, 0.1, 0.35]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, 0.42]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
