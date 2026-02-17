'use client';

import { useState, useEffect } from 'react';

interface RotatingTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export default function RotatingText({ words, className = '', interval = 2500 }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'} ${className}`}
    >
      {words[index]}
    </span>
  );
}
