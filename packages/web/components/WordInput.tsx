"use client";

import { useState } from "react";

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
          className={`input-field flex-1 ${isDuplicate ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""}`}
        />
        <button
          type="submit"
          disabled={!trimmed || isDuplicate || submitting || disabled}
          className="btn-primary whitespace-nowrap"
        >
          {submitting ? "..." : "Add"}
        </button>
      </div>
      {isDuplicate && <p className="text-xs text-red-500">This word already exists</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
