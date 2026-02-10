"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, PinInput } from "@/components/ui";
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

  useEffect(() => {
    const session = getSession(code);
    if (session) {
      router.replace(`/round/${code}`);
    }
  }, [code, router]);

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
        <p className="text-gray-500">Checking meeting room...</p>
      </main>
    );
  }

  if (roundExists === false) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-lg font-medium text-red-500">Round not found</p>
        <p className="text-sm text-gray-500">Check the code and try again.</p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          Go home
        </Button>
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
          <Input
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="How should we call you?"
            maxLength={30}
          />

          <PinInput
            value={pin}
            onChange={setPin}
            label="4-digit PIN"
            helperText="Use this PIN to rejoin from another device"
            error={error?.toLowerCase().includes("pin") ? error : undefined}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={!name.trim() || pin.length !== 4}
            loading={loading}
            className="w-full"
          >
            Join
          </Button>
        </form>
      </div>
    </main>
  );
}
