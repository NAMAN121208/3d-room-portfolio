// src/panels/PanelShell.jsx
// Floating detail card anchored beside focused 3D room objects.
// Features:
// - Anchors next to object on side with more free space, never covering object center
// - Thin SVG leader line with pulsing dot on the object
// - Responsive: transforms to bottom sheet on mobile (<640px)
// - Accessible: role="dialog", aria-labelledby, non-modal (canvas interactive)
// - Respects prefers-reduced-motion (fade only, no scale/pulse)

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function PanelShell({
  isOpen = true,
  onClose,
  title,
  subtitle,
  badge,
  anchor = null, // { x, y, rect: { left, right, top, bottom }, isCameraZoomed }
  children,
}) {
  const cardRef = useRef(null);
  const previousActiveElement = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Track window dimensions for responsive clamping & anchoring
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  // Track measured card height for accurate vertical centering
  const [cardHeight, setCardHeight] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      if (rect.height > 50 && rect.height !== cardHeight) {
        setCardHeight(rect.height);
      }
    }
  });

  // Camera zoom readiness: only show once camera finishes glide (or immediately if reduced motion)
  const isCameraZoomed = shouldReduceMotion
    ? true
    : anchor
    ? anchor.isCameraZoomed ?? true
    : true;

  const isVisible = isOpen && isCameraZoomed;

  // Accessible keyboard focus: move focus to card on open, restore on close
  useEffect(() => {
    if (!isVisible) return;

    previousActiveElement.current = document.activeElement;

    const timer = setTimeout(() => {
      if (cardRef.current) {
        const closeBtn = cardRef.current.querySelector('button[aria-label="Close card"]');
        if (closeBtn) {
          closeBtn.focus();
        } else {
          cardRef.current.focus();
        }
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function'
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isVisible]);

  // --------------------------------------------------------------------------
  // ANCHORING GEOMETRY
  // --------------------------------------------------------------------------
  const { width, height } = windowSize;
  const isMobile = width < 640;

  // Desktop card target width: clamp(300px, 28vw, 420px)
  const cardWidth = Math.min(420, Math.max(300, Math.round(width * 0.28)));

  // Object projected coordinates
  const ox = anchor?.x ?? Math.round(width * 0.45);
  const oy = anchor?.y ?? Math.round(height * 0.45);
  const oLeft = anchor?.rect?.left ?? ox - 35;
  const oRight = anchor?.rect?.right ?? ox + 35;

  // Determine side with more free space
  const spaceLeft = oLeft;
  const spaceRight = width - oRight;
  const placeOnRight = spaceRight >= spaceLeft;

  // Calculate card horizontal position (cardX)
  let cardX = 20;
  if (placeOnRight) {
    const tentativeX = oRight + 32;
    cardX = Math.max(tentativeX, ox + 24);
    cardX = Math.min(cardX, width - cardWidth - 20);
    // Guarantee card never covers object center
    if (cardX < ox + 12) cardX = ox + 12;
  } else {
    const tentativeX = oLeft - 32 - cardWidth;
    cardX = Math.max(20, tentativeX);
    // Guarantee card never covers object center
    if (cardX + cardWidth > ox - 12) cardX = ox - 12 - cardWidth;
  }

  // Calculate card vertical position (cardY)
  const effectiveCardH = Math.min(cardHeight, Math.round(height * 0.70));
  let cardY = Math.round(oy - effectiveCardH / 2);
  cardY = Math.max(20, Math.min(cardY, height - effectiveCardH - 20));

  // Attachment point on card edge for the SVG leader line
  const attachX = placeOnRight ? cardX : cardX + cardWidth;
  const attachY = Math.max(cardY + 24, Math.min(oy, cardY + effectiveCardH - 24));

  // --------------------------------------------------------------------------
  // ANIMATION VARIANTS
  // --------------------------------------------------------------------------
  const cardVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: isMobile
          ? { opacity: 0, y: 30 }
          : { opacity: 0, scale: 0.94 },
        visible: isMobile
          ? {
              opacity: 1,
              y: 0,
              transition: { type: 'spring', damping: 25, stiffness: 280 },
            }
          : {
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                damping: 24,
                stiffness: 280,
                mass: 0.85,
              },
            },
        exit: isMobile
          ? { opacity: 0, y: 20, transition: { duration: 0.14 } }
          : { opacity: 0, scale: 0.96, transition: { duration: 0.14 } },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* SVG Leader Line and Pulsing Dot (Desktop only) */}
          {!isMobile && anchor && (
            <motion.svg
              key="leader-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
              className="fixed inset-0 pointer-events-none z-30 w-full h-full"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting leader line from object to card edge */}
              <line
                x1={ox}
                y1={oy}
                x2={attachX}
                y2={attachY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeOpacity="0.7"
                strokeDasharray="4 3"
              />

              {/* Card edge connection point dot */}
              <circle cx={attachX} cy={attachY} r="2.5" fill="#f59e0b" />

              {/* Pulsing Dot on 3D object */}
              {!shouldReduceMotion && (
                <circle
                  cx={ox}
                  cy={oy}
                  r="8"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  className="animate-ping"
                  style={{ transformOrigin: `${ox}px ${oy}px` }}
                />
              )}
              <circle
                cx={ox}
                cy={oy}
                r="3.5"
                fill="#fbbf24"
                stroke="#18181b"
                strokeWidth="1"
                filter="url(#glow)"
              />
            </motion.svg>
          )}

          {/* Floating Card Container */}
          <div
            className={`fixed z-40 pointer-events-none ${
              isMobile
                ? 'inset-x-3 bottom-3 flex justify-center'
                : 'inset-0'
            }`}
          >
            <motion.div
              ref={cardRef}
              role="dialog"
              aria-labelledby="card-title"
              tabIndex={-1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={
                isMobile
                  ? {
                      width: '100%',
                      maxWidth: '480px',
                      maxHeight: '45vh',
                    }
                  : {
                      position: 'absolute',
                      left: `${cardX}px`,
                      top: `${cardY}px`,
                      width: `${cardWidth}px`,
                      maxHeight: '70vh',
                    }
              }
              className="pointer-events-auto flex flex-col bg-slate-900/85 backdrop-blur-md text-slate-100 rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/80 overflow-hidden outline-none ring-1 ring-white/10"
            >
              {/* Subtle top accent gradient */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-500/80 via-indigo-500/80 to-emerald-500/80 shrink-0" />

              {/* Card Header */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <h2
                    id="card-title"
                    className="text-sm sm:text-base font-bold tracking-tight text-slate-100 truncate"
                  >
                    {title}
                  </h2>
                  {badge && (
                    <span className="shrink-0 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      {badge}
                    </span>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close card"
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Subtitle if provided */}
              {subtitle && (
                <div className="px-4 py-1.5 bg-slate-950/30 border-b border-slate-800/50 shrink-0">
                  <p className="text-xs text-slate-400 leading-snug truncate">
                    {subtitle}
                  </p>
                </div>
              )}

              {/* Scrollable Body Content */}
              <div className="relative flex-1 overflow-y-auto px-4 py-3.5 overscroll-contain text-slate-200 focus-visible:ring-1 focus-visible:ring-amber-400/40 focus:outline-none">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
