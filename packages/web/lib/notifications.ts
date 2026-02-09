"use client";

import { useCallback, useRef, useState } from "react";
import type { ToastItem } from "@/components/ToastContainer";

let toastCounter = 0;

interface PlayerSnapshot {
  playerName: string;
  hasBingo?: boolean;
}

export function useNotifications(currentPlayerName: string) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const prevPlayersRef = useRef<Map<string, PlayerSnapshot>>(new Map());
  const prevStatusRef = useRef<string | null>(null);
  const initialized = useRef(false);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notifyPlayerChanges = useCallback(
    (players: PlayerSnapshot[]) => {
      const prevMap = prevPlayersRef.current;

      if (!initialized.current) {
        initialized.current = true;
        const newMap = new Map<string, PlayerSnapshot>();
        for (const p of players) newMap.set(p.playerName, p);
        prevPlayersRef.current = newMap;
        return;
      }

      for (const p of players) {
        const prev = prevMap.get(p.playerName);

        if (!prev) {
          if (p.playerName !== currentPlayerName) {
            addToast(`${p.playerName} joined the meeting`);
          }
        } else if (p.hasBingo && !prev.hasBingo) {
          if (p.playerName !== currentPlayerName) {
            addToast(`${p.playerName} achieved synergy!`, "success");
            navigator.vibrate?.(50);
          }
        }
      }

      const newMap = new Map<string, PlayerSnapshot>();
      for (const p of players) newMap.set(p.playerName, p);
      prevPlayersRef.current = newMap;
    },
    [currentPlayerName, addToast],
  );

  const notifyStatusChange = useCallback(
    (status: string) => {
      const prev = prevStatusRef.current;
      prevStatusRef.current = status;

      if (prev === null) return;
      if (prev === status) return;

      if (status === "collecting") {
        addToast("Word collection started");
      } else if (status === "playing") {
        addToast("Game on!", "success");
      } else if (status === "finished") {
        addToast("Game finished!");
      }
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    dismissToast,
    notifyPlayerChanges,
    notifyStatusChange,
  };
}
