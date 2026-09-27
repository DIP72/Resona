import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter component for smooth number transitions.
 * Increments/decrements numbers smoothly instead of snapping.
 */
export default function AnimatedCounter({ 
  value = 0, 
  duration = 600, 
  prefix = '', 
  suffix = '', 
  className = '',
  decimals = 0 
}) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(numValue);
  const prevValueRef = useRef(numValue);
  const animRef = useRef(null);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = numValue;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    animRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      prevValueRef.current = numValue;
    };
  }, [numValue, duration]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toString();

  return (
    <span className={`inline-block tabular-nums font-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
