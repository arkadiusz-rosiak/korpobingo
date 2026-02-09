"use client";

interface PlayerSession {
  playerName: string;
  pin: string;
}

const STORAGE_KEY = "korpobingo_sessions";

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

export function setSession(shareCode: string, playerName: string, pin: string): void {
  const sessions = getSessions();
  sessions[shareCode.toUpperCase()] = { playerName, pin };
  saveSessions(sessions);
}

export function clearSession(shareCode: string): void {
  const sessions = getSessions();
  delete sessions[shareCode.toUpperCase()];
  saveSessions(sessions);
}
