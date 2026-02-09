"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  onComplete?: (pin: string) => void;
}

export default function PinInput({
  value,
  onChange,
  length = 4,
  label,
  error,
  helperText,
  disabled = false,
  onComplete,
}: PinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [recentIndex, setRecentIndex] = useState<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const id = label?.toLowerCase().replace(/\s+/g, "-") ?? "pin-input";

  // Clear "just typed" indicator after brief flash
  useEffect(() => {
    if (recentIndex === null) return;
    const timer = setTimeout(() => setRecentIndex(null), 150);
    return () => clearTimeout(timer);
  }, [recentIndex]);

  // Fire onComplete when all digits filled
  useEffect(() => {
    if (value.length === length) {
      onCompleteRef.current?.(value);
    }
  }, [value, length]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, length);
      if (raw.length > value.length) {
        setRecentIndex(raw.length - 1);
      }
      onChange(raw);
    },
    [length, onChange, value.length],
  );

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const activeIndex = focused ? Math.min(value.length, length - 1) : -1;
  const slots = useMemo(
    () => Array.from({ length }, (_, i) => ({ key: `slot-${i}`, index: i })),
    [length],
  );

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* biome-ignore lint/a11y/noStaticElementInteractions: wrapper delegates focus to hidden input */}
      <div
        className="relative cursor-text"
        onClick={focusInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") focusInput();
        }}
      >
        {/* Hidden real input */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={label ?? `${length}-digit PIN`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
        />

        {/* Visual slots */}
        <div className="flex justify-center gap-3">
          {slots.map((slot) => {
            const digit = value[slot.index];
            const isActive = slot.index === activeIndex;
            const isFilled = digit !== undefined;
            const isRecent = slot.index === recentIndex;

            return (
              <div
                key={slot.key}
                className={`flex h-16 w-14 items-center justify-center rounded-xl border-2 font-mono text-2xl transition-all duration-200 ${
                  disabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : error
                      ? "border-red-300 bg-white text-gray-900"
                      : isActive
                        ? "border-corpo-500 bg-white shadow-sm ring-2 ring-corpo-500/20"
                        : isFilled
                          ? "border-corpo-300 bg-corpo-50/30 text-gray-900"
                          : "border-gray-300 bg-white text-gray-900"
                }`}
              >
                {isFilled ? (
                  <span
                    className={`motion-safe:transition-transform motion-safe:duration-150 ${
                      isRecent ? "motion-safe:animate-stamp" : ""
                    }`}
                  >
                    {isRecent ? digit : "●"}
                  </span>
                ) : isActive ? (
                  <span className="inline-block h-6 w-0.5 animate-pulse bg-corpo-500" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
