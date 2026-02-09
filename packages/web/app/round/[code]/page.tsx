"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import ShareCode from "@/components/ShareCode";
import ToastContainer from "@/components/ToastContainer";
import WordInput from "@/components/WordInput";
import WordList from "@/components/WordList";
import { players as playersApi, rounds, words as wordsApi } from "@/lib/api";
import { usePolling } from "@/lib/hooks";
import { useNotifications } from "@/lib/notifications";
import { getPinForSession, getSession } from "@/lib/session";
import type { Player, Round, Word } from "@/lib/types";

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const session = typeof window !== "undefined" ? getSession(code) : null;
  const playerName = session?.playerName ?? "";
  const pin = typeof window !== "undefined" ? getPinForSession(code) : null;

  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toasts, addToast, dismissToast, notifyPlayerChanges, notifyStatusChange } =
    useNotifications(playerName);

  // Fetch round data
  useEffect(() => {
    rounds
      .getByShareCode(code)
      .then(setRound)
      .catch(() => setError("Round not found"))
      .finally(() => setLoading(false));
  }, [code]);

  // Redirect to join if no session
  useEffect(() => {
    if (!loading && round && !session) {
      router.push(`/round/${code}/join`);
    }
  }, [loading, round, session, code, router]);

  // Redirect to board if game is playing
  useEffect(() => {
    if (round?.status === "playing" && session) {
      router.push(`/round/${code}/board`);
    }
  }, [round?.status, session, code, router]);

  // Poll for words and players
  const fetchWords = useCallback(
    () => (round ? wordsApi.list(round.roundId, "votes") : Promise.resolve([])),
    [round],
  );
  const fetchPlayers = useCallback(
    () => (round ? playersApi.list(round.roundId) : Promise.resolve([])),
    [round],
  );
  const fetchRound = useCallback(
    () => (round ? rounds.get(round.roundId) : Promise.reject()),
    [round],
  );

  const { data: wordList, refresh: refreshWords } = usePolling<Word[]>(fetchWords, 5000, !!round);
  const { data: playerList } = usePolling<Player[]>(fetchPlayers, 10000, !!round);
  const { data: freshRound } = usePolling<Round>(fetchRound, 10000, !!round);

  // Update round status from polling and notify on changes
  useEffect(() => {
    if (freshRound) {
      setRound(freshRound);
      notifyStatusChange(freshRound.status);
    }
  }, [freshRound, notifyStatusChange]);

  // Notify on player changes
  useEffect(() => {
    if (playerList) {
      notifyPlayerChanges(playerList);
    }
  }, [playerList, notifyPlayerChanges]);

  const handleSubmitWord = async (text: string) => {
    if (!round || !pin) return;
    await wordsApi.submit(round.roundId, text, playerName, pin);
    refreshWords();
    addToast("Word added!", "success");
  };

  const handleVote = async (wordId: string) => {
    if (!round || !pin) return;
    try {
      await wordsApi.vote(round.roundId, wordId, playerName, pin);
      refreshWords();
    } catch (err) {
      if (err instanceof Error && err.message.includes("Conflict")) {
        addToast("Already voted on this word");
      }
    }
  };

  const handleStartGame = async () => {
    if (!round || !pin) return;
    try {
      await rounds.updateStatus(round.roundId, "playing", playerName, pin);
      router.push(`/round/${code}/board`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to start", "error");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading your meeting...</p>
      </main>
    );
  }

  if (error || !round) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-500">{error || "Round not found"}</p>
        <button type="button" onClick={() => router.push("/")} className="btn-secondary">
          Go home
        </button>
      </main>
    );
  }

  if (!session) return null; // Will redirect to join

  const currentWords = wordList ?? [];
  const currentPlayers = playerList ?? [];
  const minWords = round.boardSize * round.boardSize;
  const canStart = currentWords.length >= minWords;

  return (
    <div className="min-h-screen">
      <Header shareCode={code} roundName={round.name} />

      <main className="mx-auto max-w-2xl space-y-6 p-4">
        <ShareCode code={code} />

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              Buzzwords ({currentWords.length}/{minWords} needed)
            </h2>
            {round.status === "collecting" && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Collecting
              </span>
            )}
          </div>

          {round.status === "collecting" && (
            <div className="mb-4">
              <WordInput
                existingWords={currentWords.map((w) => w.text)}
                onSubmit={handleSubmitWord}
              />
            </div>
          )}

          <WordList
            words={currentWords}
            onVote={handleVote}
            currentPlayer={playerName}
            disabled={round.status !== "collecting"}
          />
        </div>

        <div className="card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Players ({currentPlayers.length})
          </h3>
          <ul className="space-y-1">
            {currentPlayers.map((p) => (
              <li key={p.playerName} className="flex items-center gap-2 py-1 text-sm">
                <span className="text-gray-700">{p.playerName}</span>
                {p.playerName === playerName && (
                  <span className="text-xs text-gray-400">(you)</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {round.status === "collecting" && (
          <button
            type="button"
            onClick={handleStartGame}
            disabled={!canStart}
            className="btn-primary w-full"
          >
            {canStart ? "Start game" : `Need ${minWords - currentWords.length} more words`}
          </button>
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
