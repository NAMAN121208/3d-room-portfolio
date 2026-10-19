// src/ui/Loader.jsx
// Loading screen shown while the 3D scene and models load, fading out smoothly when ready.
// Features: Drei useProgress integration, fallback simulated progress, cozy isometric room theme, prefers-reduced-motion.

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useProgress } from '@react-three/drei';

export default function Loader({
  ready = false,
  onLoaded,
  minDuration = 800, // minimum milliseconds to show loader for smooth visual presentation
}) {
  const { active, progress: rawProgress, item } = useProgress();
  const shouldReduceMotion = useReducedMotion();

  const [simulatedReady, setSimulatedReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly increment progress display to prevent sudden jumps
  useEffect(() => {
    const targetProgress = ready ? 100 : Math.max(rawProgress, ready ? 100 : 0);

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= targetProgress) {
          clearInterval(interval);
          return targetProgress;
        }
        const step = Math.max(1, Math.ceil((targetProgress - prev) * 0.15));
        return Math.min(targetProgress, prev + step);
      });
    }, 25);

    return () => clearInterval(interval);
  }, [rawProgress, ready]);

  // Handle minimum duration and completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setSimulatedReady(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  const isComplete = (displayProgress >= 100 || !active) && (ready || simulatedReady);

  useEffect(() => {
    if (isComplete && onLoaded) {
      onLoaded();
    }
  }, [isComplete, onLoaded]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          key="room-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0.2 : 0.6,
              ease: 'easeInOut',
            },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0d14] text-slate-100 select-none overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="Loading 3D room portfolio"
        >
          {/* Ambient Warm Glow in Background */}
          <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-8" />
          <div className="absolute w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-y-12" />

          {/* Isometric Cube Graphic Animation */}
          <div className="relative mb-8">
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      rotateY: [0, 180, 360],
                      rotateX: [15, 25, 15],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Isometric 3D Room Box Representation */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/30 via-indigo-500/20 to-slate-800 border border-amber-500/40 shadow-2xl shadow-amber-500/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl select-none" aria-hidden="true">
                  🛋️
                </span>
              </div>
            </motion.div>
          </div>

          {/* Project Title & Status */}
          <div className="flex flex-col items-center gap-2 mb-6 text-center px-4 z-10">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 font-sans">
              3D Room Portfolio
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              {item ? `Loading: ${item.split('/').pop()}` : 'Arranging furniture & lighting...'}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-56 sm:w-64 flex flex-col gap-2 z-10">
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/60 p-[1px]">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 rounded-full"
                style={{ width: `${displayProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.15 }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>INITIALIZING</span>
              <span className="text-amber-400 font-semibold">{Math.round(displayProgress)}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
