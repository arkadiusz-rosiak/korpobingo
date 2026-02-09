"use client";

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
  return (
    <button
      type="button"
      onClick={readOnly ? undefined : onToggle}
      disabled={readOnly}
      className={`relative flex aspect-square items-center justify-center rounded-lg border-2 p-1 text-center text-xs font-medium transition-all sm:text-sm ${
        marked
          ? highlight
            ? "animate-stamp border-yellow-400 bg-yellow-50 text-yellow-800 shadow-md"
            : "animate-stamp border-corpo-600 bg-corpo-50 text-corpo-900"
          : "border-gray-200 bg-white text-gray-700 hover:border-corpo-300 hover:bg-corpo-50"
      } ${readOnly ? "cursor-default" : "cursor-pointer active:scale-95"}`}
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
