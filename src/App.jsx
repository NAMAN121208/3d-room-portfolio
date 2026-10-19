// src/App.jsx
// Phase 1 & 2: Project scaffolding, Lenis smooth scroll, and Isometric 3D Greybox Room
import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Lenis from 'lenis';

import Room from './scene/Room';
import Lights from './scene/Lights';

export default function App() {
  // Initialize Lenis smooth scrolling (configured for Phase 1)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0d14] select-none">
      {/* 3D Canvas with Low-FOV Perspective for the Isometric Look */}
      <Canvas
        shadows
        camera={{
          position: [11, 9, 11], // Isometric diagonal vantage point
          fov: 30,               // Low FOV compresses perspective for isometric look
        }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0a0d14']} />
        
        {/* Room Lighting */}
        <Lights />

        {/* Greybox Room with 7 Named Meshes */}
        <Room />

        {/* Orbit Controls to allow inspecting the greybox room */}
        <OrbitControls
          target={[0, 1.4, 0]}
          maxPolarAngle={Math.PI / 2.05} // Prevent camera going below floor
          minDistance={6}
          maxDistance={24}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Subtle UI Overlay: Project Header and Named Objects Legend */}
      <div className="absolute top-5 left-5 pointer-events-none z-10 flex flex-col gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="font-semibold text-sm tracking-wide text-slate-100">
              3D Room Portfolio • Greybox
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Phase 1 & 2 complete. Drag to orbit, scroll to zoom.
          </p>
        </div>

        {/* 7 Named Meshes verification badge */}
        <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300 flex flex-wrap gap-1.5 max-w-xs">
          <span className="font-mono text-indigo-400 font-semibold block w-full mb-1">
            Interactive Meshes (7/7):
          </span>
          {['Monitor', 'Laptop', 'Sketchbook', 'Headphones', 'Bookshelf', 'Jersey', 'Football'].map((name) => (
            <span
              key={name}
              className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-200 font-mono"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
