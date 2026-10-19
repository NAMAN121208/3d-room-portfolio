import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress(lenis) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = (trigger) => setProgress(trigger.progress);
    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
      onUpdate: update, onRefresh: update,
    });
    // Reuse App's Lenis and RAF; a second smooth scroller would fight the first.
    const unsubscribe = lenis?.on('scroll', ScrollTrigger.update);
    trigger.refresh();
    update(trigger);
    return () => { unsubscribe?.(); trigger.kill(); };
  }, [lenis]);
  return progress;
}
