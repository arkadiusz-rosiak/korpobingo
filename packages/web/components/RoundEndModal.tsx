"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";
const YOUTUBE_LOAD_TIMEOUT_MS = 3000;

interface RoundEndModalProps {
  onClose: () => void;
}

const ANTI_CELEBRATION_LINES = [
  "Please update your timesheets.",
  "Your performance review has been scheduled.",
  "This could have been an email.",
  "Action items will follow.",
  "Let's circle back on Monday.",
];

function getRandomLine(): string {
  return ANTI_CELEBRATION_LINES[Math.floor(Math.random() * ANTI_CELEBRATION_LINES.length)];
}

export default function RoundEndModal({ onClose }: RoundEndModalProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [subtext] = useState(getRandomLine);

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
    const timeout = setTimeout(() => {
      if (!videoLoaded) setVideoFailed(true);
    }, YOUTUBE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [videoLoaded]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Round ended"
    >
      <div className="relative w-full max-w-[500px] text-center md:max-w-[640px]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Title with scale-in animation */}
        <h2
          className={`mb-2 text-4xl font-bold text-white drop-shadow-lg transition-all duration-400 ${
            textVisible ? "scale-100 opacity-100" : "scale-30 opacity-0"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          Meeting Adjourned
        </h2>

        <p className="mb-6 text-lg text-gray-300">{subtext}</p>

        {/* YouTube video */}
        {!videoFailed && (
          <div className="relative mx-auto mb-4 aspect-video w-full max-w-[400px] overflow-hidden rounded-lg md:max-w-[560px]">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&controls=1&rel=0`}
              title="Round end video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className={`h-full w-full transition-opacity duration-300 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setVideoLoaded(true)}
            />
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-corpo-900/50 text-sm text-gray-300">
                Loading...
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full max-w-xs border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          View results
        </Button>
      </div>
    </div>
  );
}
