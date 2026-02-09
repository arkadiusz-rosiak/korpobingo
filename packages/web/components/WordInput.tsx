"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface WordInputProps {
  existingWords: string[];
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
}

export default function WordInput({ existingWords, onSubmit, disabled = false }: WordInputProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const trimmed = text.trim();
  const isDuplicate =
    trimmed.length > 0 && existingWords.some((w) => w.toLowerCase() === trimmed.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || isDuplicate || submitting || disabled) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmed);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit word");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a buzzword..."
          maxLength={100}
          disabled={disabled || submitting}
          className={`w-full rounded-lg border px-4 py-3 text-gray-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
            isDuplicate
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-corpo-500 focus:ring-corpo-500/20"
          }`}
        />
        <Button
          type="submit"
          size="md"
          disabled={!trimmed || isDuplicate || disabled}
          loading={submitting}
        >
          Add
        </Button>
      </div>
      {isDuplicate && <p className="text-xs text-red-500">This word already exists</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
