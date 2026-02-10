"use client";

import Link from "next/link";

interface HeaderProps {
  shareCode?: string;
  roundName?: string;
  onShareCodeClick?: () => void;
}

export default function Header({ shareCode, roundName, onShareCodeClick }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Korpo<span className="text-corpo-900">Bingo</span>
        </Link>
        {shareCode && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {roundName && <span className="hidden sm:inline">{roundName}</span>}
            {onShareCodeClick ? (
              <button
                type="button"
                onClick={onShareCodeClick}
                className="flex items-center gap-1.5 rounded bg-corpo-50 px-2 py-1 font-mono font-bold text-corpo-900 transition-colors hover:bg-corpo-100"
                aria-label="Share round code"
              >
                {shareCode}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .799l6.733 3.365a2.5 2.5 0 11-.671 1.341l-6.733-3.365a2.5 2.5 0 110-3.482l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                </svg>
              </button>
            ) : (
              <span className="rounded bg-corpo-50 px-2 py-1 font-mono font-bold text-corpo-900">
                {shareCode}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
