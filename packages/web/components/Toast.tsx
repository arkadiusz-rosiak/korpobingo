"use client";

import { useEffect, useRef, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onCloseRef.current(), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-corpo-900",
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 ${colors[type]} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
