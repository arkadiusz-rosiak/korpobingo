"use client";

import { useState } from "react";

interface ShareCodeProps {
  code: string;
}

export default function ShareCode({ code }: ShareCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  return (
    <div className="text-center">
      <p className="mb-2 text-sm font-medium text-gray-500">Share this code with your team</p>
      <button
        type="button"
        onClick={handleCopy}
        className="group relative inline-block rounded-xl bg-corpo-900 px-8 py-4 font-mono text-4xl font-bold tracking-[0.3em] text-white transition-transform active:scale-95"
      >
        {code}
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-normal tracking-normal text-gray-500">
          {copied ? "Copied!" : "Tap to copy"}
        </span>
      </button>
    </div>
  );
}
