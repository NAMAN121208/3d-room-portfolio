// src/panels/PanelShell.jsx
// Shared animated modal container for 3D room object panels
// Features: Framer Motion animation, Esc-to-close, full focus trap, accessibility, responsive sizing

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function PanelShell({
  isOpen = true,
  onClose,
  title,
  subtitle,
  badge,
  children,
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Remember previous focus and focus the modal on open; restore focus on close
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;

    // Focus close button or first focusable element after animation mount
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Handle Escape key and focus trap Tab/Shift+Tab
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      // 1. Esc to close
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      // 2. Focus Trap
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null); // only visible elements

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Motion variants with respect for prefers-reduced-motion
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, scale: 0.94, y: 24 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: 'spring', damping: 26, stiffness: 320 },
        },
        exit: {
          opacity: 0,
          scale: 0.96,
          y: 16,
          transition: { duration: 0.18, ease: 'easeOut' },
        },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden pointer-events-auto"
          role="presentation"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            tabIndex={-1}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full sm:max-w-xl md:max-w-2xl max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-slate-900/95 text-slate-100 rounded-t-3xl sm:rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/80 overflow-hidden outline-none"
          >
            {/* Cozy Warm Ambient Glow at Header */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800/80 bg-slate-900/60 z-10">
              <div className="flex flex-col gap-0.5 pr-4">
                <div className="flex items-center gap-2.5">
                  <h2
                    id="panel-title"
                    className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 font-sans"
                  >
                    {title}
                  </h2>
                  {badge && (
                    <span className="text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-400 leading-snug">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Close Button with Visible Focus Ring */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="relative flex-1 overflow-y-auto px-6 py-5 overscroll-contain text-slate-200 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus:outline-none">
              {children}
            </div>

            {/* Bottom Subtle Gradient Indicator */}
            <div className="h-2 w-full bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
