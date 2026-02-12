"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BingoBoard from "@/components/BingoBoard";
import BingoModal from "@/components/BingoModal";
import RoundEndModal from "@/components/RoundEndModal";
import Header from "@/components/Header";
import PlayerList from "@/components/PlayerList";
import ToastContainer from "@/components/ToastContainer";
import Button from "@/components/ui/Button";
import ShareCode from "@/components/ShareCode";
import Modal from "@/components/ui/Modal";
import { boards, players as playersApi, rounds } from "@/lib/api";
import { useHaptic, usePageTitle, usePolling } from "@/lib/hooks";
import { useNotifications } from "@/lib/notifications";
import { clearSession, getPinForSession, getSession } from "@/lib/session";
import type { BoardWithBingo, Player, Round } from "@/lib/types";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

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

  usePageTitle("Board");

  const session = typeof window !== "undefined" ? getSession(code) : null;
  const playerName = session?.playerName ?? "";
  const pin = typeof window !== "undefined" ? getPinForSession(code) : null;

  const [round, setRound] = useState<Round | null>(null);
  const [board, setBoard] = useState<BoardWithBingo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>([]);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const prevBingo = useRef(false);
  const endingRef = useRef(false);
  const { toasts, dismissToast, notifyPlayerChanges } = useNotifications(playerName);

  // Redirect if no session or PIN is missing (e.g. lost after sessionStorage migration)
  useEffect(() => {
    if (typeof window !== "undefined" && (!session || !pin)) {
      if (session && !pin) {
        clearSession(code);
      }
      router.push(`/round/${code}/join`);
    }
  }, [session, pin, code, router]);

  // Initial fetch
  useEffect(() => {
    if (!playerName || !pin) return;

    const init = async () => {
      try {
        const r = await rounds.getByShareCode(code);
        setRound(r);

        if (r.status === "collecting") {
          router.push(`/round/${code}`);
          return;
        }

        // Try to get existing board or create one
        try {
          const b = await boards.get(r.roundId, playerName);
          setBoard(b);
          prevBingo.current = b.hasBingo;

          if (r.status === "finished") {
            if (b.hasBingo) {
              router.push(`/round/${code}/results`);
            } else {
              setShowRoundEndModal(true);
            }
            return;
          }
        } catch {
          if (r.status === "finished") {
            router.push(`/round/${code}/results`);
            return;
          }
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

  // Poll round status and redirect to results when finished
  const fetchRound = useCallback(
    () => (round ? rounds.get(round.roundId) : Promise.reject()),
    [round],
  );
  const { data: freshRound } = usePolling<Round>(fetchRound, 10000, !!round);

  useEffect(() => {
    if (freshRound) {
      setRound(freshRound);
      if (freshRound.status === "finished") {
        if (prevBingo.current) {
          router.push(`/round/${code}/results`);
        } else {
          setShowRoundEndModal(true);
        }
      }
    }
  }, [freshRound, code, router]);

  // Countdown timer — ticks every second
  useEffect(() => {
    if (!round?.roundEndsAt || round.status === "finished") return;
    const tick = () => {
      const ms = new Date(round.roundEndsAt).getTime() - Date.now();
      setTimeRemaining(Math.max(0, ms));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [round?.roundEndsAt, round?.status]);

  // Auto-end: when countdown reaches 0 and round is still playing, transition to finished
  useEffect(() => {
    if (
      timeRemaining !== null &&
      timeRemaining <= 0 &&
      round?.status === "playing" &&
      !endingRef.current &&
      pin &&
      playerName
    ) {
      endingRef.current = true;
      rounds.updateStatus(round.roundId, "finished", playerName, pin).catch(() => {
        // Race condition: another player already ended it — polling will pick it up
        endingRef.current = false;
      });
    }
  }, [timeRemaining, round, pin, playerName]);

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
    if (!round || !board || !pin) return;

    const wasMarked = board.marked[index];
    haptic.tap();

    // Optimistic update
    const newMarked = [...board.marked];
    newMarked[index] = !wasMarked;
    setBoard({ ...board, marked: newMarked });

    try {
      const updated = wasMarked
        ? await boards.unmark(round.roundId, playerName, index, pin)
        : await boards.mark(round.roundId, playerName, index, pin);
      setBoard(updated);

      // Check if bingo just happened
      if (updated.hasBingo && !prevBingo.current) {
        prevBingo.current = true;
        setBingoCount((c) => c + 1);
        setShowBingoModal(true);
      }

      // Check if bingo was lost after unmarking
      if (!updated.hasBingo && prevBingo.current) {
        prevBingo.current = false;
        setShowBingoModal(false);
      }
    } catch {
      // Revert optimistic update
      setBoard(board);
    }
  };

  const handleLeaveRound = async () => {
    if (!round || !pin) return;
    try {
      await boards.leave(round.roundId, playerName, pin);
      clearSession(code);
      router.push("/");
    } catch {
      // silently ignore — user stays on page
    }
  };

  if (loading || !board) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Preparing your board...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header
        shareCode={code}
        roundName={round?.name}
        onShareCodeClick={() => setShowShareModal(true)}
      />

      {timeRemaining !== null && round?.status === "playing" && (
        <div className="mx-auto max-w-5xl px-4 pt-2">
          <div
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              timeRemaining <= 60000
                ? "bg-red-50 text-red-700"
                : timeRemaining <= 300000
                  ? "bg-amber-50 text-amber-700"
                  : "bg-corpo-50 text-corpo-900"
            }`}
          >
            <span>Time remaining:</span>
            <span className="font-mono tabular-nums">{formatCountdown(timeRemaining)}</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl p-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-center">
          <div
            className="mx-auto w-full flex-shrink-0 md:mx-0 md:w-auto"
            style={{ maxWidth: "var(--board-size)" }}
          >
            <BingoBoard
              cells={board.cells}
              marked={board.marked}
              size={board.size}
              bingoLines={board.bingoLines}
              onToggleCell={handleToggleCell}
            />
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setShowLeaveDialog(true)}>
                Leave round
              </Button>
            </div>
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

      {/* Celebration replay button */}
      {bingoCount > 0 && !showBingoModal && (
        <button
          type="button"
          onClick={() => setShowBingoModal(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-corpo-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Replay celebration"
        >
          <span>🎉</span>
          <span>Celebrate!</span>
        </button>
      )}

      {showBingoModal && (
        <BingoModal bingoCount={bingoCount} onClose={() => setShowBingoModal(false)} />
      )}
      <Modal open={showShareModal} onClose={() => setShowShareModal(false)}>
        <div className="flex flex-col items-center">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Invite players</h2>
          <ShareCode code={code} />
        </div>
      </Modal>
      <Modal open={showLeaveDialog} onClose={() => setShowLeaveDialog(false)}>
        <h2 className="text-lg font-semibold text-gray-900">Leave round?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your board will be deleted. If you rejoin, you&apos;ll get a new board with a random word
          layout.
        </p>
        <div className="mt-4 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setShowLeaveDialog(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleLeaveRound}>
            Leave round
          </Button>
        </div>
      </Modal>
      {showRoundEndModal && (
        <RoundEndModal
          onClose={() => {
            setShowRoundEndModal(false);
            router.push(`/round/${code}/results`);
          }}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
