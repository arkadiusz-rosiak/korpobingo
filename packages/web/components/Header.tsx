"use client";

import Link from "next/link";

interface HeaderProps {
  shareCode?: string;
  roundName?: string;
}

export default function Header({ shareCode, roundName }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Korpo<span className="text-corpo-900">Bingo</span>
        </Link>
        {shareCode && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {roundName && <span className="hidden sm:inline">{roundName}</span>}
            <span className="rounded bg-corpo-50 px-2 py-1 font-mono font-bold text-corpo-900">
              {shareCode}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
