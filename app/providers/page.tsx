
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Server,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Zap,
  Wrench,
} from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import {
  api,
  type ProviderName,
  type ProviderHealthResponse,
  type ReleaseSummary,
} from "@/lib/api";

const PROVIDERS: {
  key: ProviderName;
  label: string;
}[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openrouter", label: "OpenRouter" },
  { key: "nvidia", label: "NVIDIA" },
];

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString();
}

function formatDuration(seconds?: number) {
  if (seconds === undefined) return "Not available";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
}

function ProviderCard({
  provider,
  label,
  data,
}: {
  provider: ProviderName;
  label: string;
  data: ProviderHealthResponse["providers"][ProviderName] | undefined;
}) {
  if (!data || !data.available) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <p className="mt-3 text-sm text-gray-500">
          No provider report available.
        </p>
      </section>
    );
  }

  const metrics = data.metrics;
  const usage = metrics?.llm_usage;

  const llmFailures = data.llm_failures?.length ?? usage?.failures ?? 0;
  const toolErrors = data.tool_errors?.length ?? 0;

  const degraded = data.degraded ?? false;

  const counts = data.decision_counts ?? {};

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {label}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {provider.toUpperCase()} provider
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            degraded
              ? "bg-amber-50 text-amber-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {degraded ? "Degraded" : "No reported degradation"}
        </span>
      </div>

      <div className="mt-5 rounded-lg bg-gray-50 p-4">
        <p className="text-xs text-gray-500">Overall assessment</p>
        <p className="mt-1 text-lg font-bold text-gray-900">
          {data.overall_decision ?? "Unavailable"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-green-700">PASS</p>
          <p className="mt-1 text-lg font-bold text-green-800">
            {counts.PASS ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-red-700">FAIL</p>
          <p className="mt-1 text-lg font-bold text-red-800">
            {counts.FAIL ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-amber-700">Insufficient</p>
          <p className="mt-1 text-lg font-bold text-amber-800">
            {counts.INSUFFICIENT_EVIDENCE ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <AlertTriangle size={14} />
            LLM failures
          </span>
          <span className="font-semibold text-gray-800">
            {formatNumber(llmFailures)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Wrench size={14} />
            Tool errors
          </span>
          <span className="font-semibold text-gray-800">
            {formatNumber(toolErrors)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Clock size={14} />
            Execution time
          </span>
          <span className="font-semibold text-gray-800">
            {formatDuration(metrics?.wall_seconds)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Activity size={14} />
            Tool calls
          </span>
          <span className="font-semibold text-gray-800">
            {formatNumber(metrics?.tool_calls)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Zap size={14} />
            Total tokens
          </span>
          <span className="font-semibold text-gray-800">
            {formatNumber(usage?.total_tokens)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Incomplete requirements</span>
          <span className="font-semibold text-gray-800">
            {formatNumber(data.incomplete_requirements)}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function ProvidersPage() {
  const [release, setRelease] = useState("R2.4");

  const [summary, setSummary] = useState<ReleaseSummary | null>(null);
  const [providerData, setProviderData] =
    useState<ProviderHealthResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const loadProviderStatus = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        healthResult,
        summaryResult,
        providerResult,
      ] = await Promise.allSettled([
        api.health(),
        api.getRelease(release),
        api.getProviders(release),
      ]);

      setConnected(healthResult.status === "fulfilled");

      if (summaryResult.status === "rejected") {
        throw summaryResult.reason;
      }

      if (providerResult.status === "rejected") {
        throw providerResult.reason;
      }

      setSummary(summaryResult.value);
      setProviderData(providerResult.value);
    } catch (err) {
      setSummary(null);
      setProviderData(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve provider information."
      );
    } finally {
      setLoading(false);
    }
  }, [release]);

  useEffect(() => {
    void loadProviderStatus();
  }, [loadProviderStatus]);

  const availableProviders = PROVIDERS.filter(
    (provider) =>
      providerData?.providers?.[provider.key]?.available
  ).length;

  const degradedProviders = PROVIDERS.filter(
    (provider) =>
      providerData?.providers?.[provider.key]?.available &&
      providerData.providers[provider.key].degraded
  ).length;

  const totalLlmFailures = PROVIDERS.reduce(
    (total, provider) =>
      total +
      (providerData?.providers?.[provider.key]?.llm_failures?.length ??
        providerData?.providers?.[provider.key]?.metrics?.llm_usage?.failures ??
        0),
    0
  );

  const totalToolErrors = PROVIDERS.reduce(
    (total, provider) =>
      total +
      (providerData?.providers?.[provider.key]?.tool_errors?.length ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-[260px] min-h-screen">
        <Header
          release={release}
          onReleaseChange={setRelease}
          onRefresh={loadProviderStatus}
          loading={loading}
          connected={connected}
        />

        <main className="space-y-7 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={23} className="text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Provider Status
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Monitor Gemini, OpenRouter and NVIDIA execution reliability.
              </p>
            </div>

            <button
              onClick={loadProviderStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Unable to load provider status
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <Server size={21} className="text-indigo-600" />

                {connected ? (
                  <Wifi size={18} className="text-green-600" />
                ) : (
                  <WifiOff size={18} className="text-red-600" />
                )}
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Backend connection
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {connected ? "Online" : "Offline"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <CheckCircle2 size={21} className="text-green-600" />

              <p className="mt-4 text-xs text-gray-500">
                Available reports
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {availableProviders} / 3
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <ShieldAlert size={21} className="text-amber-600" />

              <p className="mt-4 text-xs text-gray-500">
                Degraded provider runs
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {degradedProviders}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <AlertTriangle size={21} className="text-red-600" />

              <p className="mt-4 text-xs text-gray-500">
                Total LLM failures
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {formatNumber(totalLlmFailures)}
              </p>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Provider execution details
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Assessment diagnostics for release {release}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {PROVIDERS.map((provider) => (
                <ProviderCard
                  key={provider.key}
                  provider={provider.key}
                  label={provider.label}
                  data={providerData?.providers?.[provider.key]}
                />
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Execution diagnostics
              </h2>
            </div>

            <div className="mt-5 divide-y divide-gray-100">
              <div className="flex flex-wrap justify-between gap-2 py-4">
                <span className="text-sm text-gray-500">
                  Selected release
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {release}
                </span>
              </div>

              <div className="flex flex-wrap justify-between gap-2 py-4">
                <span className="text-sm text-gray-500">
                  Jira project
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {summary?.project ?? "Unavailable"}
                </span>
              </div>

              <div className="flex flex-wrap justify-between gap-2 py-4">
                <span className="text-sm text-gray-500">
                  Total tool errors
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatNumber(totalToolErrors)}
                </span>
              </div>

              <div className="flex flex-wrap justify-between gap-2 py-4">
                <span className="text-sm text-gray-500">
                  Available provider reports
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {availableProviders} / 3
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <p className="text-xs leading-5 text-amber-800">
                  These diagnostics describe the recorded assessment runs,
                  not necessarily the providers' current live availability.
                  LLM failures and tool errors are infrastructure or
                  integration diagnostics and should be distinguished from
                  confirmed product requirement failures.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
