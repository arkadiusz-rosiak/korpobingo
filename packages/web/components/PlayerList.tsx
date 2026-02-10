"use client";

import Link from "next/link";

interface PlayerProgress {
  playerName: string;
  markedCount: number;
  totalCells: number;
  hasBingo: boolean;
}

interface PlayerListProps {
  players: PlayerProgress[];
  shareCode: string;
  currentPlayer?: string;
  showBoards?: boolean;
}

export default function PlayerList({
  players,
  shareCode,
  currentPlayer,
  showBoards = false,
}: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Players ({players.length})
      </h3>
      <ul className="space-y-1.5">
        {players.map((p) => {
          const progress = p.totalCells > 0 ? (p.markedCount / p.totalCells) * 100 : 0;
          const isMe = p.playerName === currentPlayer;

          const content = (
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                isMe ? "bg-corpo-50" : "bg-white"
              }`}
            >
              <span className={`text-sm font-medium ${isMe ? "text-corpo-900" : "text-gray-700"}`}>
                {p.playerName}
                {isMe && <span className="ml-1 text-xs text-gray-500">(you)</span>}
              </span>
              <div className="ml-auto flex items-center gap-2">
                {p.hasBingo && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                    BINGO!
                  </span>
                )}
                <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.hasBingo ? "bg-yellow-500" : "bg-corpo-600"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-gray-500">
                  {p.markedCount}/{p.totalCells}
                </span>
              </div>
            </div>
          );

          if (showBoards && !isMe) {
            return (
              <li key={p.playerName}>
                <Link href={`/round/${shareCode}/board/${encodeURIComponent(p.playerName)}`}>
                  {content}
                </Link>
              </li>
            );
          }

          return <li key={p.playerName}>{content}</li>;
        })}
      </ul>
    </div>
  );
}
