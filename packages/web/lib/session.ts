"use client";

interface PlayerSession {
  playerName: string;
}

const STORAGE_KEY = "korpobingo_sessions";
const PIN_STORAGE_KEY = "korpobingo_pins";

function getSessions(): Record<string, PlayerSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PlayerSession>) : {};
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
  sessions[shareCode.toUpperCase()] = { playerName };
  saveSessions(sessions);
}

export function clearSession(shareCode: string): void {
  const sessions = getSessions();
  delete sessions[shareCode.toUpperCase()];
  saveSessions(sessions);
  clearPinForSession(shareCode);
}

// PIN stored in sessionStorage (cleared on tab close)
function getPins(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(PIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function savePins(pins: Record<string, string>): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
}

export function getPinForSession(shareCode: string): string | null {
  const pins = getPins();
  return pins[shareCode.toUpperCase()] ?? null;
}

export function setPinForSession(shareCode: string, pin: string): void {
  const pins = getPins();
  pins[shareCode.toUpperCase()] = pin;
  savePins(pins);
}

function clearPinForSession(shareCode: string): void {
  const pins = getPins();
  delete pins[shareCode.toUpperCase()];
  savePins(pins);
}
