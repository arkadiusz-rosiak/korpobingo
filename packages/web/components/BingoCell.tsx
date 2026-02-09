"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

interface BingoCellProps {
  text: string;
  marked: boolean;
  highlight: boolean;
  onToggle: () => void;
  readOnly?: boolean;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
}

const BingoCell = forwardRef<HTMLButtonElement, BingoCellProps>(
  function BingoCell(
    {
      text,
      marked,
      highlight,
      onToggle,
      readOnly = false,
      tabIndex,
      onKeyDown,
      onFocus,
    },
    ref,
  ) {
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
      <div role="gridcell" aria-checked={marked}>
        <button
          ref={ref}
          type="button"
          onClick={readOnly ? undefined : onToggle}
          disabled={readOnly}
          onAnimationEnd={handleAnimationEnd}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          tabIndex={tabIndex}
          aria-pressed={marked}
          className={`relative flex aspect-square min-h-[44px] min-w-[44px] w-full items-center justify-center rounded-lg border-2 p-1 text-center font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corpo-600 ${
            marked
              ? highlight
                ? "border-yellow-400 bg-yellow-50 text-yellow-800 shadow-md motion-safe:animate-bingo-glow"
                : "border-corpo-600 bg-corpo-50 text-corpo-900"
              : "border-gray-200 bg-white text-gray-700 hover:border-corpo-300 hover:bg-corpo-50"
          } ${animClass} ${readOnly ? "cursor-default" : "cursor-pointer active:scale-95"}`}
          style={{ fontSize: "clamp(0.7rem, 2.5vw, 0.9rem)" }}
        >
          <span className="line-clamp-3 break-words leading-tight">{text}</span>
          {marked && (
            <span
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-corpo-900 text-[10px] text-white"
              aria-hidden="true"
            >
              &#10003;
            </span>
          )}
        </button>
      </div>
    );
  },
);

export default BingoCell;
