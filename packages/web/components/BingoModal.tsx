"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

const YOUTUBE_VIDEO_ID = "v1-W54M8FVc";
const YOUTUBE_LOAD_TIMEOUT_MS = 3000;

interface BingoModalProps {
  onClose: () => void;
  bingoCount?: number;
}

function getCelebrationText(count: number): string {
  switch (count) {
    case 1:
      return "Synergy Achieved!";
    case 2:
      return "Double synergy!";
    case 3:
      return "Triple synergy!";
    default:
      return "Total alignment!";
  }
}

function getCelebrationSubtext(count: number): string {
  if (count === 1) return "Your alignment is unprecedented.";
  return "The game continues — more bingos mean higher ranking!";
}

function getConfettiDuration(count: number): number {
  if (count === 1) return 3000;
  if (count === 2) return 1000;
  return 500;
}

function fireHaptic(count: number) {
  if (!("vibrate" in navigator)) return;
  if (count === 1) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  } else if (count === 2) {
    navigator.vibrate([100, 50, 100]);
  } else {
    navigator.vibrate([100]);
  }
}

export default function BingoModal({ onClose, bingoCount = 1 }: BingoModalProps) {
  const fired = useRef(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const isFirstBingo = bingoCount === 1;

  // Confetti + haptic
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fireHaptic(bingoCount);

    const duration = getConfettiDuration(bingoCount);
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: isFirstBingo ? 4 : 2,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.9 },
        colors: ["#1a237e", "#3f51b5", "#ffd700", "#c0c0c0"],
      });
      confetti({
        particleCount: isFirstBingo ? 4 : 2,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.9 },
        colors: ["#1a237e", "#3f51b5", "#ffd700", "#c0c0c0"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [bingoCount, isFirstBingo]);

  // Text scale-in animation trigger
  useEffect(() => {
    const raf = requestAnimationFrame(() => setTextVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ESC key dismiss
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // YouTube load timeout fallback
  useEffect(() => {
    if (!isFirstBingo) return;
    const timeout = setTimeout(() => {
      if (!videoLoaded) setVideoFailed(true);
    }, YOUTUBE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isFirstBingo, videoLoaded]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bingo celebration"
    >
      <div className="relative w-full max-w-[500px] text-center">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Close celebration"
        >
          ✕
        </button>

        {/* Celebration text with scale-in animation */}
        <h2
          className={`mb-2 text-4xl font-bold text-white drop-shadow-lg transition-all duration-400 ${
            textVisible ? "scale-100 opacity-100" : "scale-30 opacity-0"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          {getCelebrationText(bingoCount)}
        </h2>

        <p className="mb-6 text-lg text-gray-300">{getCelebrationSubtext(bingoCount)}</p>

        {/* YouTube video — first bingo only */}
        {isFirstBingo && !videoFailed && (
          <div className="relative mx-auto mb-4 aspect-video w-full max-w-[400px] overflow-hidden rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&controls=1&rel=0`}
              title="Bingo celebration video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className={`h-full w-full transition-opacity duration-300 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setVideoLoaded(true)}
            />
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-corpo-900/50 text-sm text-gray-300">
                Loading celebration...
              </div>
            )}
          </div>
        )}

        {isFirstBingo && !videoFailed && (
          <p className="mb-4 text-xs text-gray-400">
            🔇 Audio disabled for meeting safety. Unmute at your own risk.
          </p>
        )}

        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full max-w-xs border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          Return to the meeting
        </Button>
      </div>
    </div>
  );
}
