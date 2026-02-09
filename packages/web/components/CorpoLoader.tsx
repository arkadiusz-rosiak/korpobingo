"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Aligning stakeholders...",
  "Leveraging best practices...",
  "Circling back to the server...",
  "Optimizing synergies...",
  "Consulting the roadmap...",
];

export default function CorpoLoader({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-corpo-900 border-t-transparent" />
      <p className="text-sm font-medium text-gray-500">{MESSAGES[index]}</p>
    </div>
  );
}
