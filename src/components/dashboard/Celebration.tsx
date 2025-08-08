'use client';

import { useEffect, useRef } from 'react';

export function Celebration({ trigger }: { trigger: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !ref.current) return;
    const el = ref.current;
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
    const t = setTimeout(() => {
      el.classList.add('opacity-0');
    }, 1500);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center opacity-0 transition-opacity duration-500">
      <div className="text-5xl">🎉</div>
    </div>
  );
}

export default Celebration;


