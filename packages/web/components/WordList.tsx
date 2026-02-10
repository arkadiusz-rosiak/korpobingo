"use client";

import type { Word } from "@/lib/types";

interface WordListProps {
  words: Word[];
  onVote: (wordId: string) => Promise<void>;
  onUnvote?: (wordId: string) => Promise<void>;
  onDelete?: (wordId: string) => Promise<void>;
  currentPlayer: string;
  disabled?: boolean;
}

export default function WordList({
  words,
  onVote,
  onUnvote,
  onDelete,
  currentPlayer,
  disabled = false,
}: WordListProps) {
  if (words.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No buzzwords yet. Be the first to add one!
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {words.map((word) => {
        const hasVoted = word.votedBy?.includes(currentPlayer);
        return (
          <li key={word.wordId} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2">
            <span className="flex-1 text-sm text-gray-700">{word.text}</span>
            <span className="text-xs text-gray-400">by {word.submittedBy}</span>
            {onDelete && word.submittedBy === currentPlayer && !disabled && (
              <button
                type="button"
                onClick={() => onDelete(word.wordId)}
                className="rounded p-1 text-gray-300 transition-colors hover:text-red-500"
                title="Delete word"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => (hasVoted ? onUnvote?.(word.wordId) : onVote(word.wordId))}
              disabled={!hasVoted && disabled}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                hasVoted
                  ? "bg-corpo-100 text-corpo-900 hover:bg-red-50 hover:text-red-700"
                  : "bg-gray-100 text-gray-600 hover:bg-corpo-50 hover:text-corpo-900"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span>{hasVoted ? "\u2605" : "\u2606"}</span>
              <span>{word.votes}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
