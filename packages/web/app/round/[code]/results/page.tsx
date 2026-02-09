"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BingoBoard from "@/components/BingoBoard";
import Header from "@/components/Header";
import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { boards, players as playersApi, rounds } from "@/lib/api";
import type { BoardWithBingo, Player, Round } from "@/lib/types";

interface PlayerRanking {
  playerName: string;
  bingoCount: number;
  markedCount: number;
  totalCells: number;
  board: BoardWithBingo;
}

function computeRankings(
  playerList: Player[],
  boardResults: (BoardWithBingo | null)[],
): PlayerRanking[] {
  const rankings: PlayerRanking[] = [];
  for (let i = 0; i < playerList.length; i++) {
    const board = boardResults[i];
    if (!board) continue;
    rankings.push({
      playerName: playerList[i].playerName,
      bingoCount: board.bingoLines.length,
      markedCount: board.marked.filter(Boolean).length,
      totalCells: board.cells.length,
      board,
    });
  }
  rankings.sort((a, b) => {
    if (b.bingoCount !== a.bingoCount) return b.bingoCount - a.bingoCount;
    return b.markedCount - a.markedCount;
  });
  return rankings;
}

const HEADERS = [
  "Meeting adjourned",
  "Quarterly review complete",
  "That could have been an email",
  "Let's circle back never",
];

function pickHeader(roundId: string): string {
  let hash = 0;
  for (let i = 0; i < roundId.length; i++) {
    hash = (hash * 31 + roundId.charCodeAt(i)) | 0;
  }
  return HEADERS[Math.abs(hash) % HEADERS.length];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const [round, setRound] = useState<Round | null>(null);
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await rounds.getByShareCode(code);
        setRound(r);

        if (r.status !== "finished") {
          router.replace(`/round/${code}/board`);
          return;
        }

        const playerList = await playersApi.list(r.roundId);
        const boardResults = await Promise.all(
          playerList.map((p) =>
            boards.get(r.roundId, p.playerName).catch(() => null),
          ),
        );

        setRankings(computeRankings(playerList, boardResults));
      } catch {
        setError("Could not load results");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Tallying the scores...</p>
      </main>
    );
  }

  if (error || !round) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500">{error || "Round not found"}</p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          Go home
        </Button>
      </main>
    );
  }

  const selectedBoard = selectedPlayer
    ? rankings.find((r) => r.playerName === selectedPlayer)
    : null;

  return (
    <div className="min-h-screen pb-8">
      <Header shareCode={code} roundName={round.name} />

      <main className="mx-auto max-w-2xl space-y-6 p-4">
        {/* Title */}
        <div className="pt-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {pickHeader(round.roundId)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{round.name}</p>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Leaderboard</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {rankings.length === 0 && (
              <p className="text-center text-sm text-gray-400">
                No players found
              </p>
            )}
            {rankings.map((player, index) => {
              const isWinner = index === 0 && player.bingoCount > 0;
              return (
                <button
                  key={player.playerName}
                  type="button"
                  onClick={() =>
                    setSelectedPlayer(
                      selectedPlayer === player.playerName
                        ? null
                        : player.playerName,
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50 ${
                    selectedPlayer === player.playerName
                      ? "bg-corpo-50 ring-2 ring-corpo-200"
                      : ""
                  } ${isWinner ? "bg-yellow-50" : ""}`}
                >
                  {/* Position */}
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                    {isWinner ? (
                      <span className="inline-block animate-crown-shimmer text-lg">
                        👑
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>

                  {/* Name and stats */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-gray-900">
                        {player.playerName}
                      </span>
                      {isWinner && (
                        <Badge variant="warning">Winner</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        {player.bingoCount}{" "}
                        {player.bingoCount === 1 ? "bingo" : "bingos"}
                      </span>
                      <span>
                        {player.markedCount}/{player.totalCells} marked
                      </span>
                    </div>
                  </div>

                  {/* Bingo count badge */}
                  {player.bingoCount > 0 && (
                    <Badge variant="success">{player.bingoCount}</Badge>
                  )}
                </button>
              );
            })}
          </CardBody>
        </Card>

        {/* Selected player's board (read-only) */}
        {selectedBoard && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {selectedBoard.playerName}&apos;s board
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="text-sm text-corpo-900 hover:underline"
                >
                  Close
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <BingoBoard
                cells={selectedBoard.board.cells}
                marked={selectedBoard.board.marked}
                size={selectedBoard.board.size}
                bingoLines={selectedBoard.board.bingoLines}
                onToggleCell={() => {}}
                readOnly
              />
            </CardBody>
          </Card>
        )}

        {/* New round CTA */}
        <div className="pt-2">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push("/create")}
          >
            New round
          </Button>
        </div>
      </main>
    </div>
  );
}
