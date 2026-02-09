import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="w-full max-w-md space-y-6">
        <p className="text-8xl font-bold text-corpo-900">404</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          This resource is not available in the current quarter
        </h1>
        <p className="text-gray-500">
          It may have been deprioritized, moved to the backlog, or was never
          approved by leadership.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-corpo-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-corpo-800 active:bg-corpo-700"
        >
          Return to lobby
        </Link>
      </div>
    </main>
  );
}
