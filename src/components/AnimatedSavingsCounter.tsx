import React, { useState, useEffect } from 'react';

interface Props {
  targetValue: number;
  durationMs?: number;
  prefix?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedSavingsCounter: React.FC<Props> = ({
  targetValue,
  durationMs = 1000,
  prefix = '$',
  style,
}) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + easeOut * (targetValue - startVal);
      setDisplayVal(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, durationMs]);

  return (
    <span style={style}>
      {prefix}{displayVal.toFixed(2)}
    </span>
  );
};
