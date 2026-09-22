'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates a statistic from 0 to its target when scrolled into view.
 * Accepts CMS values like "25+", "100%" or "3" and preserves any prefix/suffix,
 * so admins can type whatever they like without breaking the animation.
 */
export default function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const raw = String(value ?? '');
    const match = raw.match(/(\D*)(\d+(?:\.\d+)?)(\D*)/);

    // Not numeric (e.g. "Growing") — just render the text as-is.
    if (!match) {
      setDisplay(raw);
      return;
    }

    const [, prefix, numberText, suffix] = match;
    const target = parseFloat(numberText);
    const decimals = (numberText.split('.')[1] || '').length;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setDisplay(raw);
      return;
    }

    setDisplay(`${prefix}0${suffix}`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(node);

        const start = performance.now();
        let frame;

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutCubic — fast start, gentle settle
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = (target * eased).toFixed(decimals);
          setDisplay(`${prefix}${current}${suffix}`);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        node._cancel = () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      node._cancel?.();
    };
  }, [value, duration]);

  return <span ref={ref}>{display ?? value}</span>;
}
