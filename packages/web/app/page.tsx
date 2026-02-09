"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError("Code must be 6 characters");
      return;
    }
    router.push(`/round/${trimmed}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold tracking-tight">
            Korpo<span className="text-corpo-900">Bingo</span>
          </h1>
          <p className="mt-3 text-gray-500">Surviving meetings, one buzzword at a time.</p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => router.push("/create")} className="w-full">
            Create a round
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or join existing</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="ENTER CODE"
              maxLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-lg tracking-[0.2em] text-gray-900 transition-colors placeholder:text-gray-400 focus:border-corpo-500 focus:outline-none focus:ring-2 focus:ring-corpo-500/20"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={code.trim().length !== 6}
            >
              Join
            </Button>
          </form>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <p className="text-xs text-gray-400">
          Per company policy, fun is neither endorsed nor prohibited.
        </p>
      </div>
    </main>
  );
}
