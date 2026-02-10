"use client";

import { useMemo, useState } from "react";

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

interface DurationPickerProps {
  value: number;
  onChange: (durationDays: number) => void;
}

export default function DurationPicker({ value, onChange }: DurationPickerProps) {
  const initialMode: DurationMode = value < 1 ? "hours" : "days";
  const [durationMode, setDurationMode] = useState<DurationMode>(initialMode);
  const [durationHours, setDurationHours] = useState<number>(value < 1 ? value * 24 : 4);
  const [durationDayCount, setDurationDayCount] = useState<number>(value >= 1 ? value : 1);

  const handleHoursChange = (h: number) => {
    setDurationHours(h);
    onChange(hoursToDays(h));
  };

  const handleDaysChange = (d: number) => {
    setDurationDayCount(d);
    onChange(d);
  };

  const handleModeChange = (mode: DurationMode) => {
    setDurationMode(mode);
    if (mode === "hours") {
      onChange(hoursToDays(durationHours));
    } else {
      onChange(durationDayCount);
    }
  };

  const currentDays = durationMode === "hours" ? hoursToDays(durationHours) : durationDayCount;

  const endsAtPreview = useMemo(() => {
    const end = new Date(Date.now() + currentDays * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [currentDays]);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-gray-700">Round duration</span>

      {/* Segmented control: Hours / Days */}
      <div className="mb-3 flex rounded-lg bg-gray-100 p-1">
        {(["hours", "days"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeChange(mode)}
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
                onClick={() => handleHoursChange(h)}
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
                onClick={() => handleDaysChange(d)}
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
            onChange={(e) => handleHoursChange(HOUR_STEPS[Number(e.target.value) - 1])}
            className="w-full accent-corpo-900"
          />
        ) : (
          <input
            type="range"
            min={1}
            max={DAY_STEPS.length}
            value={durationDayCount}
            onChange={(e) => handleDaysChange(Number(e.target.value))}
            className="w-full accent-corpo-900"
          />
        )}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{durationMode === "hours" ? "30 min" : "1 day"}</span>
          <span className="font-medium text-corpo-900">
            {durationMode === "hours" ? formatHours(durationHours) : formatDays(durationDayCount)}
          </span>
          <span>{durationMode === "hours" ? "24h" : "31 days"}</span>
        </div>
      </div>

      {/* End time preview */}
      <p className="mt-2 text-center text-xs text-gray-600">
        Ends: <span className="font-medium text-gray-800">{endsAtPreview}</span>
      </p>
    </div>
  );
}
