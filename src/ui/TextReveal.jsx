// src/ui/TextReveal.jsx
// Reusable text-reveal component and hook (word-by-word, character-by-character, and slide-in)
// Supports custom tags, staggered timing, and respects prefers-reduced-motion.

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';

/**
 * Reusable component for cinematic text reveals.
 * Usage:
 * <TextReveal text="Hi, I'm Naman" as="h1" mode="words" className="text-3xl font-bold" />
 */
export default function TextReveal({
  text = '',
  as: Component = 'span',
  mode = 'words', // 'words' | 'chars' | 'slide'
  delay = 0,
  stagger = 0.04,
  className = '',
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion is preferred, render with a gentle fade, no movement
  if (shouldReduceMotion) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay }}
        className={`inline-block ${className}`}
        {...props}
      >
        {text}
      </motion.span>
    );
  }

  // Simple slide-in for entire block
  if (mode === 'slide') {
    return (
      <Component className={`overflow-hidden ${className}`} {...props}>
        <motion.span
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 260,
            delay,
          }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </Component>
    );
  }

  // Character-by-character reveal
  if (mode === 'chars') {
    const characters = Array.from(text);
    return (
      <Component className={`inline-flex flex-wrap ${className}`} {...props}>
        {characters.map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.2, 0.65, 0.3, 0.9],
              delay: delay + index * (stagger * 0.6),
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </Component>
    );
  }

  // Default: Word-by-word reveal
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 16,
      rotateX: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 280,
      },
    },
  };

  return (
    <Component className={`inline-flex flex-wrap gap-x-1.5 ${className}`} {...props}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="inline-flex flex-wrap gap-x-1.5"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            className="inline-block will-change-transform"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}

/**
 * Reusable GSAP hook for direct DOM text animation.
 * Usage:
 * const titleRef = useRef(null);
 * useTextReveal(titleRef, { delay: 0.2 });
 */
export function useTextReveal(targetRef, options = {}) {
  const { delay = 0, duration = 0.6, stagger = 0.05 } = options;

  useEffect(() => {
    if (!targetRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(targetRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, delay });
      return;
    }

    const tween = gsap.fromTo(
      targetRef.current,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
      }
    );

    return () => {
      tween.kill();
    };
  }, [targetRef, delay, duration, stagger]);
}
