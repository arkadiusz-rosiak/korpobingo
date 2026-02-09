"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiRequestError, players, rounds } from "@/lib/api";
import { getSession, setPinForSession, setSession } from "@/lib/session";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roundExists, setRoundExists] = useState<boolean | null>(null);
  const [roundId, setRoundId] = useState("");

  // Check session — if already joined, redirect
  useEffect(() => {
    const session = getSession(code);
    if (session) {
      router.replace(`/round/${code}`);
    }
  }, [code, router]);

  // Check round exists
  useEffect(() => {
    rounds
      .getByShareCode(code)
      .then((r) => {
        setRoundExists(true);
        setRoundId(r.roundId);
      })
      .catch(() => setRoundExists(false));
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.length !== 4 || !roundId) return;

    setLoading(true);
    setError("");
    try {
      await players.register(roundId, name.trim(), pin);
      setSession(code, name.trim());
      setPinForSession(code, pin);
      router.push(`/round/${code}`);
    } catch (err) {
      if (err instanceof ApiRequestError && err.message.includes("already exists")) {
        // Player exists — try verifying PIN to rejoin
        try {
          await players.verify(roundId, name.trim(), pin);
          setSession(code, name.trim());
          setPinForSession(code, pin);
          router.push(`/round/${code}`);
        } catch {
          setError("Player name taken and PIN doesn't match");
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to join");
      }
    } finally {
      setLoading(false);
    }
  };

  if (roundExists === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Checking meeting room...</p>
      </main>
    );
  }

  if (roundExists === false) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-lg font-medium text-red-500">Round not found</p>
        <p className="text-sm text-gray-400">Check the code and try again.</p>
        <button type="button" onClick={() => router.push("/")} className="btn-secondary">
          Go home
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mb-2 inline-block rounded bg-corpo-50 px-3 py-1 font-mono text-lg font-bold tracking-[0.2em] text-corpo-900">
            {code}
          </span>
          <h1 className="text-2xl font-bold">Join the round</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we call you?"
              maxLength={30}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="pin" className="mb-1.5 block text-sm font-medium text-gray-700">
              4-digit PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
              }}
              placeholder="Your secret PIN"
              maxLength={4}
              className="input-field text-center font-mono text-xl tracking-[0.5em]"
            />
            <p className="mt-1 text-xs text-gray-400">Use this PIN to rejoin from another device</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={!name.trim() || pin.length !== 4 || loading}
            className="btn-primary w-full"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </main>
  );
}
