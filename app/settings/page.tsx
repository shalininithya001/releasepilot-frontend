
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Settings,
  Server,
  GitBranch,
  ShieldCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  Info,
} from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [release, setRelease] = useState("R2.4");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    setLoading(true);

    try {
      await api.health();
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-[260px] min-h-screen">
        <Header
          release={release}
          onReleaseChange={setRelease}
          onRefresh={checkConnection}
          loading={loading}
          connected={connected}
        />

        <main className="space-y-7 p-8">
          <div>
            <div className="flex items-center gap-2">
              <Settings size={23} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              View ReleasePilot application and assessment configuration.
            </p>
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900">
                Application
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Current application connection details.
              </p>
            </div>

            <div className="divide-y divide-gray-100 px-5">
              <div className="flex flex-wrap items-center justify-between gap-3 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Server size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Backend API
                    </p>
                    <p className="text-xs text-gray-500">
                      ReleasePilot backend connection
                    </p>
                  </div>
                </div>

                {connected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <Wifi size={13} /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                    <WifiOff size={13} /> Disconnected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <GitBranch size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Selected release
                    </p>
                    <p className="text-xs text-gray-500">
                      Release currently displayed in the dashboard
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-gray-700">
                  {release}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Application version
                    </p>
                    <p className="text-xs text-gray-500">
                      Current ReleasePilot version
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold text-gray-700">
                  1.0.0
                </span>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900">
                Assessment Configuration
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Configuration information for the assessment engine.
              </p>
            </div>

            <div className="divide-y divide-gray-100 px-5">
              <div className="py-5">
                <p className="text-sm font-semibold text-gray-800">
                  Assessment execution
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Sequential requirement assessment with checkpoint and resume
                  support.
                </p>
              </div>

              <div className="py-5">
                <p className="text-sm font-semibold text-gray-800">
                  AI provider
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Provider configuration is managed by the backend environment.
                  API credentials are not exposed in the frontend.
                </p>
              </div>

              <div className="py-5">
                <p className="text-sm font-semibold text-gray-800">
                  Evidence assessment
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Requirements are evaluated using available Jira evidence.
                  Provider failures should be reported separately from product
                  failures.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Configuration management
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                These settings are currently read-only. Provider credentials,
                Jira configuration, and assessment parameters remain in the
                backend environment and are not editable from this page.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={checkConnection}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Check backend connection
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
