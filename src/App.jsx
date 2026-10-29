// src/App.jsx
// Phase 4 & Floating Detail Panels:
// Replaced full-screen modal overlays with compact floating cards anchored to 3D objects.
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Lenis from 'lenis';

import Room from './scene/Room';
import Lights from './scene/Lights';
import CameraRig from './scene/CameraRig';
import ObjectAnchor from './scene/ObjectAnchor';
import { stops, scrollSectionVh, scrollHint } from './content';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useClickToZoom } from './hooks/useClickToZoom';

// Object Detail Panels
import GithubPanel from './panels/GithubPanel';
import GamesPanel from './panels/GamesPanel';
import SketchGallery from './panels/SketchGallery';
import SpotifyPanel from './panels/SpotifyPanel';
import FootballPanel from './panels/FootballPanel';
import ReadingPanel from './panels/ReadingPanel';

export default function App() {
  const [scrollDriver, setScrollDriver] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [anchorData, setAnchorData] = useState(null);
  const reducedMotion = useReducedMotion();
  const { focusedId, isFocused, focus, unfocus } = useClickToZoom(scrollDriver);

  // Optional URL parameter (?focus=laptop) for testing and direct deep-linking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialFocus = new URLSearchParams(window.location.search).get('focus');
      if (initialFocus) {
        focus(initialFocus.toLowerCase());
      }
    }
  }, [focus]);

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    if (reducedMotion) {
      setScrollDriver(null);
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    setScrollDriver(lenis);

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
  }, [reducedMotion]);

  // Find the content entry corresponding to the focused object
  const activeStop = stops.find(
    (s) =>
      s.id === focusedId ||
      (s.meshName && s.meshName.toLowerCase() === focusedId?.toLowerCase())
  );

  return (
    <div
      className="relative w-full bg-[#0a0d14] select-none"
      style={{ height: `${100 + (stops.length - 1) * scrollSectionVh}vh` }}
    >
      <div className="fixed inset-0">
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

          {/* Greybox Room with Hover Highlights & Click Selection */}
          <Room
            onSelectObject={focus}
            hoveredObject={hoveredObject}
            onHoverObject={setHoveredObject}
          />

          {/* Camera Rig with smooth click-to-zoom interpolation */}
          <CameraRig
            lenis={scrollDriver}
            reducedMotion={reducedMotion}
            focusedId={focusedId}
          />

          {/* 3D Object Anchor & Projected Screen Position Tracker */}
          <ObjectAnchor
            focusedId={focusedId}
            onAnchorUpdate={setAnchorData}
          />
        </Canvas>
      </div>

      {/* Active Object Floating Detail Panels */}
      {focusedId === 'monitor' && (
        <GithubPanel
          isOpen={true}
          onClose={unfocus}
          data={activeStop}
          anchor={anchorData}
        />
      )}

      {focusedId === 'laptop' && (
        <GamesPanel
          isOpen={true}
          onClose={unfocus}
          data={activeStop}
          anchor={anchorData}
        />
      )}

      {focusedId === 'sketchbook' && (
        <SketchGallery
          isOpen={true}
          onClose={unfocus}
          data={activeStop}
          anchor={anchorData}
        />
      )}

      {focusedId === 'headphones' && (
        <SpotifyPanel
          isOpen={true}
          onClose={unfocus}
          data={activeStop}
          anchor={anchorData}
        />
      )}

      {(focusedId === 'football' || focusedId === 'jersey') && (
        <FootballPanel
          isOpen={true}
          onClose={unfocus}
          data={activeStop}
          anchor={anchorData}
        />
      )}

      {focusedId === 'bookshelf' && (
        <ReadingPanel
          isOpen={true}
          onClose={unfocus}
          data={activeStop}
          anchor={anchorData}
        />
      )}

      {/* Subtle UI Overlay: Project Header and Status */}
      <div className="absolute top-5 left-5 pointer-events-none z-10 flex flex-col gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl max-w-sm pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isFocused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <h1 className="font-semibold text-sm tracking-wide text-slate-100">
              3D Room Portfolio • {isFocused ? `Focused: ${activeStop?.title || focusedId}` : 'Overview'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isFocused
              ? 'Press Esc or click button to return to room overview.'
              : 'Click any object to zoom in and open panel, or ' + scrollHint}
          </p>
          {isFocused && (
            <button
              type="button"
              onClick={unfocus}
              className="mt-2 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors"
            >
              ← Return to Room (Esc)
            </button>
          )}
        </div>

        {/* 7 Named Meshes verification & quick-jump pills */}
        <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300 flex flex-wrap gap-1.5 max-w-xs pointer-events-auto">
          <span className="font-mono text-indigo-400 font-semibold block w-full mb-1">
            Interactive Meshes (click to zoom):
          </span>
          {['Monitor', 'Laptop', 'Sketchbook', 'Headphones', 'Bookshelf', 'Jersey', 'Football'].map(
            (name) => {
              const isTarget = focusedId === name.toLowerCase();
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => focus(name.toLowerCase())}
                  className={`px-2 py-0.5 rounded text-left font-mono transition-colors border ${
                    isTarget
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-800/80 border-slate-700/50 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {name}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
