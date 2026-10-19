// src/hooks/useClickToZoom.js
// State machine managing click-to-zoom camera transitions and Lenis scroll locking
// States:
// - idle: scroll drives the camera path
// - focused(objectId): camera glides and locks to that object, Lenis scroll disabled
// - unfocus restores previous scroll position with no jump

import { useState, useCallback, useEffect, useRef } from 'react';

export function useClickToZoom(lenis) {
  const [state, setState] = useState({ status: 'idle', objectId: null });
  const savedScroll = useRef(0);

  const focus = useCallback((objectId) => {
    if (!objectId) return;
    if (lenis) {
      savedScroll.current = lenis.scroll;
      lenis.stop();
    } else if (typeof window !== 'undefined') {
      savedScroll.current = window.scrollY;
    }
    setState({ status: 'focused', objectId: objectId.toLowerCase() });
  }, [lenis]);

  const unfocus = useCallback(() => {
    setState({ status: 'idle', objectId: null });
    if (lenis) {
      lenis.start();
    }
  }, [lenis]);

  // Handle Esc key to exit zoom mode
  useEffect(() => {
    if (state.status !== 'focused') return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        unfocus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, unfocus]);

  return {
    status: state.status,
    focusedId: state.objectId,
    isFocused: state.status === 'focused',
    focus,
    unfocus,
  };
}
