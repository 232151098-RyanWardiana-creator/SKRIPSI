"use client";

import { useEffect, useRef, useState } from "react";

interface TimerProps {
  deadline?: number;
  seconds?: number;
  onExpire?: () => void;
}

export function Timer({ deadline, seconds = 1800, onExpire }: TimerProps) {
  const [left, setLeft] = useState(seconds);
  const expired = useRef(false);

  useEffect(() => {
    expired.current = false;
    const target = deadline ?? Date.now() + seconds * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0 && !expired.current) {
        expired.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadline, seconds, onExpire]);

  return <span className="tabular-nums font-semibold">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</span>;
}
