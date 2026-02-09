"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BingoBoard from "@/components/BingoBoard";
import BingoModal from "@/components/BingoModal";
import Header from "@/components/Header";
import PlayerList from "@/components/PlayerList";
import ToastContainer from "@/components/ToastContainer";
import { boards, players as playersApi, rounds } from "@/lib/api";
import { useHaptic, usePolling } from "@/lib/hooks";
import { useNotifications } from "@/lib/notifications";
import { getPinForSession, getSession } from "@/lib/session";
import type { BoardWithBingo, Player, Round } from "@/lib/types";

interface PlayerProgress {
  playerName: string;
  markedCount: number;
  totalCells: number;
  hasBingo: boolean;
}

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const haptic = useHaptic();

  const session = typeof window !== "undefined" ? getSession(code) : null;
  const playerName = session?.playerName ?? "";
  const pin = typeof window !== "undefined" ? getPinForSession(code) : null;

  const [round, setRound] = useState<Round | null>(null);
  const [board, setBoard] = useState<BoardWithBingo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const prevBingo = useRef(false);
  const { toasts, dismissToast, notifyPlayerChanges } = useNotifications(playerName);

  // Redirect if no session
  useEffect(() => {
    if (typeof window !== "undefined" && !session) {
      router.push(`/round/${code}/join`);
    }
  }, [session, code, router]);

  // Initial fetch
  useEffect(() => {
    if (!playerName || !pin) return;

    const init = async () => {
      try {
        const r = await rounds.getByShareCode(code);
        setRound(r);

        // Try to get existing board or create one
        try {
          const b = await boards.get(r.roundId, playerName);
          setBoard(b);
          prevBingo.current = b.hasBingo;
        } catch {
          // Board doesn't exist — create it
          const newBoard = await boards.create(r.roundId, playerName, pin);
          const b = await boards.get(r.roundId, playerName);
          setBoard(b ?? (newBoard as unknown as BoardWithBingo));
        }
      } catch {
        router.push(`/round/${code}`);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [code, playerName, pin, router]);

  // Poll other players' progress
  const fetchProgress = useCallback(async (): Promise<PlayerProgress[]> => {
    if (!round) return [];
    const playerList = await playersApi.list(round.roundId);
    const boardResults = await Promise.all(
      playerList.map((p: Player) => boards.get(round.roundId, p.playerName).catch(() => null)),
    );
    return playerList.map((p: Player, i: number) => {
      const b = boardResults[i];
      return {
        playerName: p.playerName,
        markedCount: b ? b.marked.filter(Boolean).length : 0,
        totalCells: b ? b.cells.length : 0,
        hasBingo: b ? b.hasBingo : false,
      };
    });
  }, [round]);

  const { data: progress, error: progressError } = usePolling<PlayerProgress[]>(
    fetchProgress,
    4000,
    !!round,
  );

  useEffect(() => {
    if (progress) {
      setPlayerProgress(progress);
      notifyPlayerChanges(progress);
    }
  }, [progress, notifyPlayerChanges]);

  const handleToggleCell = async (index: number) => {
    if (!round || !board || board.marked[index] || !pin) return;

    haptic.tap();

    // Optimistic update
    const newMarked = [...board.marked];
    newMarked[index] = true;
    setBoard({ ...board, marked: newMarked });

    try {
      const updated = await boards.mark(round.roundId, playerName, index, pin);
      setBoard(updated);

      // Check if bingo just happened
      if (updated.hasBingo && !prevBingo.current) {
        prevBingo.current = true;
        haptic.bingo();
        setShowBingoModal(true);
      }
    } catch {
      // Revert optimistic update
      setBoard(board);
    }
  };

  if (loading || !board) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Preparing your board...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header shareCode={code} roundName={round?.name} />

      <main className="mx-auto max-w-5xl p-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-center">
          <div className="mx-auto w-full flex-shrink-0 md:mx-0 md:w-auto" style={{ maxWidth: "var(--board-size)" }}>
            <BingoBoard
              cells={board.cells}
              marked={board.marked}
              size={board.size}
              bingoLines={board.bingoLines}
              onToggleCell={handleToggleCell}
            />
          </div>

          <div className="w-full md:min-w-[240px] md:max-w-xs">
            {progressError && (
              <p className="mb-2 text-xs text-orange-500">Connection lost — retrying...</p>
            )}
            <PlayerList
              players={playerProgress}
              shareCode={code}
              currentPlayer={playerName}
              showBoards
            />
          </div>
        </div>
      </main>

      {showBingoModal && <BingoModal onClose={() => setShowBingoModal(false)} />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
