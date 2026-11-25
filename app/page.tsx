
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  RefreshCw,
  Clock,
  Zap,
  Wrench,
  Coins,
} from "lucide-react";

import {
  api,
  type ReleaseSummary,
  type RequirementsResponse,
  type ProviderHealthResponse,
  type ProviderName,
} from "@/lib/api";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { RequirementTable } from "@/components/dashboard/requirement-table";

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
  if (seconds === undefined) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
}

function ProviderCard({
  provider,
  summary,
  reliability,
}: {
  provider: ProviderName;
  summary: ReleaseSummary["providers"][ProviderName];
  reliability?: ProviderHealthResponse["providers"][ProviderName];
}) {
  const label =
    PROVIDERS.find((item) => item.key === provider)?.label ?? provider;

  const counts = summary.counts ?? {};
  const usage = reliability?.metrics?.llm_usage;

  const llmFailures =
    reliability?.llm_failures?.length ?? usage?.failures ?? 0;

  const toolErrors = reliability?.tool_errors?.length ?? 0;

  const degraded = summary.degraded || reliability?.degraded;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {label}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {summary.model ?? "Model information unavailable"}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            degraded
              ? "bg-amber-50 text-amber-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {degraded ? "Degraded" : "Healthy"}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Overall decision
        </p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          {summary.overall ?? "Unavailable"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-green-700">Passed</p>
          <p className="mt-1 text-lg font-bold text-green-800">
            {counts.PASS ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-red-700">Failed</p>
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
            {formatDuration(summary.wall_seconds)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Coins size={14} />
            Total tokens
          </span>
          <span className="font-semibold text-gray-800">
            {formatNumber(summary.tokens ?? usage?.total_tokens)}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [release, setRelease] = useState("R2.4");

  const [summary, setSummary] = useState<ReleaseSummary | null>(null);
  const [requirements, setRequirements] =
    useState<RequirementsResponse | null>(null);
  const [providerHealth, setProviderHealth] =
    useState<ProviderHealthResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [healthResult, summaryResult, requirementsResult, providersResult] =
        await Promise.allSettled([
          api.health(),
          api.getRelease(release),
          api.getRequirements(release),
          api.getProviders(release),
        ]);

      setConnected(healthResult.status === "fulfilled");

      if (summaryResult.status === "rejected") {
        throw summaryResult.reason;
      }

      if (requirementsResult.status === "rejected") {
        throw requirementsResult.reason;
      }

      setSummary(summaryResult.value);
      setRequirements(requirementsResult.value);

      if (providersResult.status === "fulfilled") {
        setProviderHealth(providersResult.value);
      } else {
        setProviderHealth(null);
      }
    } catch (err) {
      setSummary(null);
      setRequirements(null);
      setProviderHealth(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load release assessment."
      );
    } finally {
      setLoading(false);
    }
  }, [release]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const rows = requirements?.requirements ?? [];

  const agreementStats = useMemo(() => {
    const agreed = rows.filter((item) => item.agree === true).length;
    const disagreed = rows.filter((item) => item.agree === false).length;
    const inconclusive = rows.length - agreed - disagreed;

    return { agreed, disagreed, inconclusive };
  }, [rows]);

  const totalRequirements =
    requirements?.total ?? summary?.total_requirements ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-[260px] min-h-screen">
        <Header
          release={release}
          onReleaseChange={setRelease}
          onRefresh={loadDashboard}
          loading={loading}
          connected={connected}
        />

        <main className="space-y-7 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Release Overview
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Compare Jira requirement assessments across three LLM providers.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                <p className="text-sm font-semibold text-red-800">
                  Unable to load assessment
                </p>
              </div>

              <p className="mt-2 text-sm text-red-700">{error}</p>

              <p className="mt-2 text-xs text-red-600">
                Check that the backend is running and the API URL is correct.
              </p>
            </div>
          )}

          {loading && !summary && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Activity
                size={28}
                className="mx-auto animate-pulse text-indigo-600"
              />
              <p className="mt-3 text-sm font-medium text-gray-700">
                Loading provider comparison...
              </p>
            </div>
          )}

          {summary && requirements && (
            <>
              <section>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    Release statistics
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {summary.project} · Dataset: {summary.dataset_label}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Requirements"
                    value={totalRequirements}
                    description="Requirements in this release"
                    icon={ClipboardCheck}
                    iconColor="text-indigo-600"
                    iconBackground="bg-indigo-50"
                  />

                  <StatCard
                    title="Provider Agreement"
                    value={agreementStats.agreed}
                    description="All providers returned the same decision"
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                    iconBackground="bg-green-50"
                  />

                  <StatCard
                    title="Disagreement"
                    value={agreementStats.disagreed}
                    description="Providers returned different decisions"
                    icon={AlertTriangle}
                    iconColor="text-amber-600"
                    iconBackground="bg-amber-50"
                  />

                  <StatCard
                    title="Inconclusive"
                    value={agreementStats.inconclusive}
                    description="No definitive agreement result"
                    icon={Activity}
                    iconColor="text-gray-600"
                    iconBackground="bg-gray-100"
                  />
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-gray-900">
                    LLM provider comparison
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Assessment decisions and execution reliability for each provider.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {PROVIDERS.map((provider) => (
                    <ProviderCard
                      key={provider.key}
                      provider={provider.key}
                      summary={summary.providers[provider.key]}
                      reliability={
                        providerHealth?.providers[provider.key]
                      }
                    />
                  ))}
                </div>
              </section>

              <RequirementTable requirements={rows} />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 text-xs text-gray-400">
                <span>
                  Release: {summary.release} · Project: {summary.project}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} />
                  ReleasePilot Assessment Dashboard
                </span>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
