"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="w-full max-w-md space-y-6">
        <p className="text-6xl font-bold text-red-500">Oops</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          Something went wrong. Please circle back later.
        </h1>
        <p className="text-gray-500">
          Our team has been notified and is aligning on next steps. We appreciate your patience as
          we work to resolve this action item.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
