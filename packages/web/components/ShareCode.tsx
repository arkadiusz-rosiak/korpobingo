"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";

interface ShareCodeProps {
  code: string;
}

type CopiedState = "idle" | "code" | "link";

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M13.887 3.182c.396.037.79.08 1.183.128C16.194 3.45 17 4.414 17 5.517V16.75A2.25 2.25 0 0114.75 19h-9.5A2.25 2.25 0 013 16.75V5.517c0-1.103.806-2.068 1.93-2.207.393-.048.787-.09 1.183-.128A3.001 3.001 0 019 1h2c1.373 0 2.531.923 2.887 2.182zM7.5 4A1.5 1.5 0 019 2.5h2A1.5 1.5 0 0112.5 4v.5h-5V4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .799l6.733 3.365a2.5 2.5 0 11-.671 1.341l-6.733-3.365a2.5 2.5 0 110-3.482l6.733-3.366A2.52 2.52 0 0113 4.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function getRoundUrl(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/round/${code}`;
}

export default function ShareCode({ code }: ShareCodeProps) {
  const [copied, setCopied] = useState<CopiedState>("idle");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ text: "test", url: "https://example.com" }),
    );
  }, []);

  const showCopiedFeedback = useCallback((type: "code" | "link") => {
    setCopied(type);
    setTimeout(() => setCopied("idle"), 2000);
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showCopiedFeedback("code");
    } catch {
      // Silently fail - clipboard API may not be available
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getRoundUrl(code));
      showCopiedFeedback("link");
    } catch {
      // Silently fail - clipboard API may not be available
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: "Join my KorpoBingo round!",
        text: `Join my KorpoBingo round with code: ${code}`,
        url: getRoundUrl(code),
      });
    } catch (err) {
      // User cancelled or share failed - ignore AbortError
      if (err instanceof Error && err.name !== "AbortError") {
        // Fallback to copy link
        await handleCopyLink();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-gray-500">
        Share this code with your team
      </p>

      <div
        className="select-all rounded-2xl bg-corpo-900 px-8 py-5 font-mono text-4xl font-bold tracking-[0.3em] text-white sm:text-5xl"
        aria-label={`Share code: ${code.split("").join(" ")}`}
      >
        {code}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyCode}
          aria-label="Copy code to clipboard"
        >
          {copied === "code" ? (
            <>
              <CheckIcon className="mr-1.5 h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="mr-1.5 h-4 w-4" />
              Copy code
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          aria-label="Copy round link to clipboard"
        >
          {copied === "link" ? (
            <>
              <CheckIcon className="mr-1.5 h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon className="mr-1.5 h-4 w-4" />
              Copy link
            </>
          )}
        </Button>

        {canNativeShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNativeShare}
            aria-label="Share round"
          >
            <ShareIcon className="mr-1.5 h-4 w-4" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
