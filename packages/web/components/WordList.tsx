"use client";

import type { Word } from "@/lib/types";

interface WordListProps {
  words: Word[];
  onVote: (wordId: string) => Promise<void>;
  currentPlayer: string;
  disabled?: boolean;
}

export default function WordList({
  words,
  onVote,
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
            <button
              type="button"
              onClick={() => onVote(word.wordId)}
              disabled={hasVoted || disabled}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                hasVoted
                  ? "bg-corpo-100 text-corpo-900"
                  : "bg-gray-100 text-gray-600 hover:bg-corpo-50 hover:text-corpo-900"
              } disabled:cursor-not-allowed`}
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
