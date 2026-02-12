"use client";

interface PlayerSession {
  playerName: string;
  pin?: string;
}

const STORAGE_KEY = "korpobingo_sessions";
const LEGACY_PIN_KEY = "korpobingo_pins";

function getSessions(): Record<string, PlayerSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const sessions: Record<string, PlayerSession> = raw ? JSON.parse(raw) : {};

    // One-time migration: merge pins from legacy separate storage
    const legacyPinsRaw =
      localStorage.getItem(LEGACY_PIN_KEY) || sessionStorage.getItem(LEGACY_PIN_KEY);
    if (legacyPinsRaw) {
      const legacyPins: Record<string, string> = JSON.parse(legacyPinsRaw);
      for (const [code, pin] of Object.entries(legacyPins)) {
        if (sessions[code] && !sessions[code].pin) {
          sessions[code].pin = pin;
        }
      }
      localStorage.removeItem(LEGACY_PIN_KEY);
      sessionStorage.removeItem(LEGACY_PIN_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }

    return sessions;
  } catch {
    return {};
  }
}

function saveSessions(sessions: Record<string, PlayerSession>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSession(shareCode: string): PlayerSession | null {
  const sessions = getSessions();
  return sessions[shareCode.toUpperCase()] ?? null;
}

export function setSession(shareCode: string, playerName: string): void {
  const sessions = getSessions();
  const existing = sessions[shareCode.toUpperCase()];
  sessions[shareCode.toUpperCase()] = { playerName, pin: existing?.pin };
  saveSessions(sessions);
}

export function clearSession(shareCode: string): void {
  const sessions = getSessions();
  delete sessions[shareCode.toUpperCase()];
  saveSessions(sessions);
}

export function getPinForSession(shareCode: string): string | null {
  const sessions = getSessions();
  return sessions[shareCode.toUpperCase()]?.pin ?? null;
}

export function setPinForSession(shareCode: string, pin: string): void {
  const sessions = getSessions();
  const existing = sessions[shareCode.toUpperCase()];
  if (existing) {
    existing.pin = pin;
  } else {
    sessions[shareCode.toUpperCase()] = { playerName: "", pin };
  }
  saveSessions(sessions);
}
