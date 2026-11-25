
"use client";

import {
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

interface HeaderProps {
  release: string;
  onReleaseChange: (release: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  connected?: boolean;
}

export function Header({
  release,
  onRefresh,
  loading = false,
  connected = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Release Assessment
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Monitor release readiness and evidence quality
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend status */}
        <div className="hidden items-center gap-2 rounded-full border border-gray-200 px-3 py-2 md:flex">
          {connected ? (
            <>
              <Wifi size={14} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Backend connected
              </span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-red-500" />
              <span className="text-xs font-medium text-red-600">
                Backend disconnected
              </span>
            </>
          )}
        </div>

        {/* Fixed release display */}
        <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5">
          <span className="text-xs font-medium text-indigo-500">
            Release
          </span>
          <span className="text-sm font-bold text-indigo-700">
            {release}
          </span>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh assessment"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>
    </header>
  );
}
