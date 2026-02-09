"use client";

import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal } from "@/components/ui";

interface BingoModalProps {
  onClose: () => void;
  bingoCount?: number;
}

const YOUTUBE_VIDEO_ID = "v1-W54M8FVc";
const AUTO_DISMISS_MS = 8000;
const YOUTUBE_LOAD_TIMEOUT_MS = 3000;

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

function getHapticPattern(count: number): number[] {
  if (count === 1) return [100, 50, 100, 50, 200];
  if (count === 2) return [100, 50, 100];
  return [100];
}

function getConfettiDuration(count: number): number {
  if (count === 1) return 3000;
  if (count === 2) return 1000;
  return 500;
}

export default function BingoModal({ onClose, bingoCount = 1 }: BingoModalProps) {
  const fired = useRef(false);
  const [showVideo, setShowVideo] = useState(true);
  const videoLoadTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Haptic feedback
  useEffect(() => {
    navigator.vibrate?.(getHapticPattern(bingoCount));
  }, [bingoCount]);

  // Confetti from both corners
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const duration = getConfettiDuration(bingoCount);
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
  }, [bingoCount]);

  // YouTube load timeout — hide video if iframe fails to load within 3s
  useEffect(() => {
    videoLoadTimer.current = setTimeout(() => {
      setShowVideo(false);
    }, YOUTUBE_LOAD_TIMEOUT_MS);

    return () => {
      if (videoLoadTimer.current) clearTimeout(videoLoadTimer.current);
    };
  }, []);

  const handleVideoLoad = useCallback(() => {
    if (videoLoadTimer.current) clearTimeout(videoLoadTimer.current);
  }, []);

  const celebrationText = getCelebrationText(bingoCount);

  return (
    <Modal open onClose={onClose}>
      <div className="text-center">
        <h2 className="animate-scale-in mb-4 text-3xl font-bold text-corpo-900">
          {celebrationText}
        </h2>

        {showVideo && (
          <div className="mb-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&controls=1&rel=0`}
                title="Bingo celebration"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                onLoad={handleVideoLoad}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Audio disabled for meeting safety. Unmute at your own risk.
            </p>
          </div>
        )}

        <p className="mb-4 text-gray-600">
          Looks like someone said all the right buzzwords today.
        </p>
        <p className="mb-6 text-sm text-gray-400">
          The game continues &mdash; more bingos mean higher ranking!
        </p>
        <Button onClick={onClose} className="w-full">
          Return to the meeting
        </Button>
      </div>
    </Modal>
  );
}
