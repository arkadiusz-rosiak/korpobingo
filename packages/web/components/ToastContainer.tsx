"use client";

import { useEffect, useRef, useState } from "react";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastEntryProps {
  toast: ToastItem;
  onClose: (id: string) => void;
  duration: number;
}

function ToastEntry({ toast, onClose, duration }: ToastEntryProps) {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onCloseRef.current(toast.id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, toast.id]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-corpo-900",
  };

  return (
    <div
      className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 ${colors[toast.type]} ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      {toast.message}
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  duration?: number;
}

export default function ToastContainer({
  toasts,
  onDismiss,
  duration = 4000,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastEntry key={t.id} toast={t} onClose={onDismiss} duration={duration} />
      ))}
    </div>
  );
}
