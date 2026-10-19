// src/ui/Cursor.jsx
// Custom interactive cursor that follows pointer and expands over interactive elements.
// Automatically hides on touch devices and respects prefers-reduced-motion.

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export default function Cursor() {
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for trailing outer ring
  const springConfig = shouldReduceMotion
    ? { damping: 1000, stiffness: 1000 } // Instant
    : { damping: 24, stiffness: 350, mass: 0.5 };

  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverLabel, setHoverLabel] = useState('');

  useEffect(() => {
    // Detect touch / mobile devices (coarse pointer)
    const checkTouch = () => {
      const isTouch =
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Detect if hovering over clickable or interactive element
      const target = e.target;
      const isInteractiveElement = Boolean(
        target?.closest(
          'a, button, [role="button"], input, select, textarea, [data-interactive], [tabindex]:not([tabindex="-1"])'
        )
      );

      // Also detect 3D canvas mesh hover (Room.jsx sets document.body.style.cursor = 'pointer')
      const isPointerCursor =
        window.getComputedStyle(document.body).cursor === 'pointer' ||
        (target && window.getComputedStyle(target).cursor === 'pointer');

      const isTargetInteractive = isInteractiveElement || isPointerCursor;
      setIsHovering(isTargetInteractive);

      // Check if element provides custom cursor label (e.g. data-cursor="Zoom")
      const labelAttr = target?.closest('[data-cursor]')?.getAttribute('data-cursor');
      setHoverLabel(labelAttr || (isPointerCursor && target?.tagName === 'CANVAS' ? 'Explore' : ''));
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isTouchDevice, isVisible, mouseX, mouseY]);

  // Do not render on touch/mobile devices
  if (isTouchDevice) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Outer Ring / Aura */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border flex items-center justify-center transition-colors duration-200"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          width: isHovering ? 48 : 28,
          height: isHovering ? 48 : 28,
          scale: isClicking ? 0.85 : 1,
          borderColor: isHovering
            ? 'rgba(251, 191, 36, 0.7)' // Amber glow on hover
            : 'rgba(148, 163, 184, 0.4)', // Slate ring idle
          backgroundColor: isHovering
            ? 'rgba(245, 158, 11, 0.12)'
            : 'rgba(255, 255, 255, 0.02)',
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0.05 }
            : { type: 'spring', damping: 20, stiffness: 300 }
        }
      >
        {hoverLabel && isHovering && (
          <span className="text-[9px] font-mono font-bold tracking-tight text-amber-300 uppercase pointer-events-none select-none">
            {hoverLabel}
          </span>
        )}
      </motion.div>

      {/* Central Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-amber-400 shadow-md shadow-amber-500/50"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? (isHovering && hoverLabel ? 0 : 1) : 0,
          scale: isClicking ? 0.6 : isHovering ? 1.4 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
