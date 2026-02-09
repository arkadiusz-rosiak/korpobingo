"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BingoBoard from "@/components/BingoBoard";
import Header from "@/components/Header";
import { boards, rounds } from "@/lib/api";
import { usePolling } from "@/lib/hooks";
import type { BoardWithBingo } from "@/lib/types";

export default function PlayerBoardPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const playerName = decodeURIComponent(params.player as string);

  const [roundId, setRoundId] = useState<string | null>(null);
  const [roundName, setRoundName] = useState("");

  useEffect(() => {
    rounds.getByShareCode(code).then((r) => {
      setRoundId(r.roundId);
      setRoundName(r.name);
    });
  }, [code]);

  const fetchBoard = useCallback(
    () => (roundId ? boards.get(roundId, playerName) : Promise.reject()),
    [roundId, playerName],
  );

  const { data: board } = usePolling<BoardWithBingo>(fetchBoard, 4000, !!roundId);

  if (!board) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading board...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header shareCode={code} roundName={roundName} />

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {playerName}&apos;s board
            {board.hasBingo && (
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                BINGO!
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-corpo-900 hover:underline"
          >
            Back
          </button>
        </div>

        <BingoBoard
          cells={board.cells}
          marked={board.marked}
          size={board.size}
          bingoLines={board.bingoLines}
          onToggleCell={() => {}}
          readOnly
        />
      </main>
    </div>
  );
}
