"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { rounds } from "@/lib/api";
import { usePageTitle } from "@/lib/hooks";

export default function CreatePage() {
  usePageTitle("New Round");
  const router = useRouter();
  const [name, setName] = useState("");
  const [boardSize, setBoardSize] = useState<3 | 4>(4);
  const [duration, setDuration] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      const round = await rounds.create(name.trim(), boardSize, duration);
      router.push(`/round/${round.shareCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create round");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">New Round</h1>

        <form onSubmit={handleCreate} className="space-y-6">
          <Input
            label="Meeting name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g., "Q4 Strategy Sync"'
            maxLength={100}
            error={error || undefined}
          />

          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Board size</span>
            <div className="grid grid-cols-2 gap-3">
              {([3, 4] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBoardSize(size)}
                  className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-colors ${
                    boardSize === size
                      ? "border-corpo-900 bg-corpo-50 text-corpo-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {size}x{size}
                  <span className="block text-xs text-gray-500">{size * size} words needed</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Round duration</span>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(
                [
                  { value: 1 / 24, label: "1 hour" },
                  { value: 4 / 24, label: "4 hours" },
                  { value: 1, label: "1 day" },
                  { value: 3, label: "3 days" },
                  { value: 7, label: "7 days" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`rounded-lg border-2 px-3 py-2 text-center text-sm font-medium transition-colors ${
                    duration === opt.value
                      ? "border-corpo-900 bg-corpo-50 text-corpo-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!name.trim()} loading={loading} className="w-full">
            Create round
          </Button>
        </form>
      </div>
    </main>
  );
}
