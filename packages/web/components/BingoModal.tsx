"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

interface BingoModalProps {
  onClose: () => void;
}

export default function BingoModal({ onClose }: BingoModalProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#1a237e", "#3f51b5", "#ffd700"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#1a237e", "#3f51b5", "#ffd700"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="animate-fade-in card max-w-sm text-center">
        <h2 className="mb-2 text-3xl font-bold text-corpo-900">BINGO!</h2>
        <p className="mb-4 text-gray-600">Looks like someone said all the right buzzwords today.</p>
        <p className="mb-6 text-sm text-gray-400">
          The game continues &mdash; more bingos mean higher ranking!
        </p>
        <button type="button" onClick={onClose} className="btn-primary w-full">
          Back to the meeting
        </button>
      </div>
    </div>
  );
}
