"use client";

import { useEffect, useRef, useState } from "react";

interface BingoCellProps {
  text: string;
  marked: boolean;
  highlight: boolean;
  onToggle: () => void;
  readOnly?: boolean;
}

export default function BingoCell({
  text,
  marked,
  highlight,
  onToggle,
  readOnly = false,
}: BingoCellProps) {
  const prevMarked = useRef(marked);
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (marked && !prevMarked.current) {
      setAnimClass("motion-safe:animate-stamp");
    } else if (!marked && prevMarked.current) {
      setAnimClass("motion-safe:animate-unmark");
    }
    prevMarked.current = marked;
  }, [marked]);

  const handleAnimationEnd = () => setAnimClass("");

  return (
    <button
      type="button"
      onClick={readOnly ? undefined : onToggle}
      disabled={readOnly}
      onAnimationEnd={handleAnimationEnd}
      className={`relative flex aspect-square items-center justify-center rounded-lg border-2 p-1 text-center text-xs font-medium transition-colors duration-200 sm:text-sm ${
        marked
          ? highlight
            ? "border-yellow-400 bg-yellow-50 text-yellow-800 shadow-md motion-safe:animate-bingo-glow"
            : "border-corpo-600 bg-corpo-50 text-corpo-900"
          : "border-gray-200 bg-white text-gray-700 hover:border-corpo-300 hover:bg-corpo-50"
      } ${animClass} ${readOnly ? "cursor-default" : "cursor-pointer active:scale-95"}`}
    >
      <span className="line-clamp-3 break-words leading-tight">{text}</span>
      {marked && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-corpo-900 text-[10px] text-white">
          &#10003;
        </span>
      )}
    </button>
  );
}
