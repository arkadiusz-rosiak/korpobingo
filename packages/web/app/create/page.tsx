"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";
import { rounds } from "@/lib/api";
import { usePageTitle } from "@/lib/hooks";

type DurationMode = "hours" | "days";

const HOUR_STEPS = Array.from({ length: 48 }, (_, i) => (i + 1) * 0.5);
const DAY_STEPS = Array.from({ length: 31 }, (_, i) => i + 1);

const QUICK_HOURS = [1, 2, 4, 8];
const QUICK_DAYS = [1, 3, 7, 14];

function formatHours(h: number): string {
  if (h < 1) return "30 min";
  if (h % 1 === 0) return `${h}h`;
  return `${Math.floor(h)}h 30m`;
}

function formatDays(d: number): string {
  return d === 1 ? "1 day" : `${d} days`;
}

function hoursToDays(h: number): number {
  return h / 24;
}

export default function CreatePage() {
  usePageTitle("New Round");
  const router = useRouter();
  const [name, setName] = useState("");
  const [boardSize, setBoardSize] = useState<3 | 4>(4);
  const [durationMode, setDurationMode] = useState<DurationMode>("hours");
  const [durationHours, setDurationHours] = useState<number>(4);
  const [durationDayCount, setDurationDayCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const durationDays = durationMode === "hours" ? hoursToDays(durationHours) : durationDayCount;

  const endsAtPreview = useMemo(() => {
    const end = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [durationDays]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      const round = await rounds.create(name.trim(), boardSize, durationDays);
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

            {/* Segmented control: Hours / Days */}
            <div className="mb-3 flex rounded-lg bg-gray-100 p-1">
              {(["hours", "days"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDurationMode(mode)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    durationMode === mode
                      ? "bg-white text-corpo-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {mode === "hours" ? "Hours" : "Days"}
                </button>
              ))}
            </div>

            {/* Quick-pick chips */}
            <div className="mb-3 flex flex-wrap gap-2">
              {durationMode === "hours"
                ? QUICK_HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDurationHours(h)}
                      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        durationHours === h
                          ? "border-corpo-900 bg-corpo-50 text-corpo-900"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {formatHours(h)}
                    </button>
                  ))
                : QUICK_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDayCount(d)}
                      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                        durationDayCount === d
                          ? "border-corpo-900 bg-corpo-50 text-corpo-900"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {formatDays(d)}
                    </button>
                  ))}
            </div>

            {/* Range slider */}
            <div className="space-y-1">
              {durationMode === "hours" ? (
                <input
                  type="range"
                  min={1}
                  max={HOUR_STEPS.length}
                  value={HOUR_STEPS.indexOf(durationHours) + 1}
                  onChange={(e) => setDurationHours(HOUR_STEPS[Number(e.target.value) - 1])}
                  className="w-full accent-corpo-900"
                />
              ) : (
                <input
                  type="range"
                  min={1}
                  max={DAY_STEPS.length}
                  value={durationDayCount}
                  onChange={(e) => setDurationDayCount(Number(e.target.value))}
                  className="w-full accent-corpo-900"
                />
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{durationMode === "hours" ? "30 min" : "1 day"}</span>
                <span className="font-medium text-corpo-900">
                  {durationMode === "hours"
                    ? formatHours(durationHours)
                    : formatDays(durationDayCount)}
                </span>
                <span>{durationMode === "hours" ? "24h" : "31 days"}</span>
              </div>
            </div>

            {/* End time preview */}
            <p className="mt-2 text-center text-xs text-gray-500">
              Ends: <span className="font-medium text-gray-700">{endsAtPreview}</span>
            </p>
          </div>

          <Button type="submit" disabled={!name.trim()} loading={loading} className="w-full">
            Create round
          </Button>
        </form>
      </div>
    </main>
  );
}
