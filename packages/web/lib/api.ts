import type { ApiError } from "./types";

const ROUNDS_API = process.env.NEXT_PUBLIC_ROUNDS_API_URL ?? "";
const WORDS_API = process.env.NEXT_PUBLIC_WORDS_API_URL ?? "";
const PLAYERS_API = process.env.NEXT_PUBLIC_PLAYERS_API_URL ?? "";
const BOARDS_API = process.env.NEXT_PUBLIC_BOARDS_API_URL ?? "";

class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

function retryDelay(attempt: number): number {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  const jitter = exponential * 0.5 * Math.random();
  return exponential + jitter;
}

function isRetryable(status: number, method: string | undefined): boolean {
  if (method && method !== "GET") return false;
  return status === 408 || status === 429 || status >= 500;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data as ApiError;
        const apiErr = new ApiRequestError(
          err.error || "Request failed",
          err.code || "UNKNOWN",
          res.status,
        );

        if (attempt < MAX_RETRIES && isRetryable(res.status, options?.method)) {
          lastError = apiErr;
          await new Promise((r) => setTimeout(r, retryDelay(attempt)));
          continue;
        }

        throw apiErr;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiRequestError) throw error;

      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, retryDelay(attempt)));
        continue;
      }
    }
  }

  throw lastError;
}

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  );
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

// --- Rounds ---
export const rounds = {
  create: (name: string, boardSize?: 3 | 4) =>
    request<import("./types").Round>(`${ROUNDS_API}`, {
      method: "POST",
      body: JSON.stringify({ name, boardSize }),
    }),

  getByShareCode: (shareCode: string) =>
    request<import("./types").Round>(`${ROUNDS_API}${qs({ shareCode })}`),

  get: (roundId: string) => request<import("./types").Round>(`${ROUNDS_API}${qs({ roundId })}`),

  updateStatus: (roundId: string, status: string, playerName: string, pin: string) =>
    request<{ ok: boolean }>(`${ROUNDS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "updateStatus", roundId, status, playerName, pin }),
    }),
};

// --- Words ---
export const words = {
  submit: (roundId: string, text: string, submittedBy: string, pin: string) =>
    request<import("./types").Word>(`${WORDS_API}`, {
      method: "POST",
      body: JSON.stringify({ roundId, text, submittedBy, pin }),
    }),

  vote: (roundId: string, wordId: string, playerName: string, pin: string) =>
    request<{ ok: boolean }>(`${WORDS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "vote", roundId, wordId, playerName, pin }),
    }),

  unvote: (roundId: string, wordId: string, playerName: string, pin: string) =>
    request<{ ok: boolean }>(`${WORDS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "unvote", roundId, wordId, playerName, pin }),
    }),

  list: (roundId: string, sortBy?: "votes") =>
    request<import("./types").Word[]>(`${WORDS_API}${qs({ roundId, sortBy })}`),
};

// --- Players ---
export const players = {
  register: (roundId: string, playerName: string, pin: string) =>
    request<import("./types").Player>(`${PLAYERS_API}`, {
      method: "POST",
      body: JSON.stringify({ roundId, playerName, pin }),
    }),

  verify: (roundId: string, playerName: string, pin: string) =>
    request<{ ok: boolean }>(`${PLAYERS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "verify", roundId, playerName, pin }),
    }),

  list: (roundId: string) =>
    request<import("./types").Player[]>(`${PLAYERS_API}${qs({ roundId })}`),
};

// --- Boards ---
export const boards = {
  create: (roundId: string, playerName: string, pin: string) =>
    request<import("./types").Board>(`${BOARDS_API}`, {
      method: "POST",
      body: JSON.stringify({ roundId, playerName, pin }),
    }),

  get: (roundId: string, playerName: string) =>
    request<import("./types").BoardWithBingo>(`${BOARDS_API}${qs({ roundId, playerName })}`),

  mark: (roundId: string, playerName: string, cellIndex: number, pin: string) =>
    request<import("./types").BoardWithBingo>(`${BOARDS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "mark", roundId, playerName, cellIndex, pin }),
    }),

  unmark: (roundId: string, playerName: string, cellIndex: number, pin: string) =>
    request<import("./types").BoardWithBingo>(`${BOARDS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "unmark", roundId, playerName, cellIndex, pin }),
    }),

  leave: (roundId: string, playerName: string, pin: string) =>
    request<{ ok: boolean }>(`${BOARDS_API}`, {
      method: "POST",
      body: JSON.stringify({ action: "leave", roundId, playerName, pin }),
    }),
};

export { ApiRequestError };
