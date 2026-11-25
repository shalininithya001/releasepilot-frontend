
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
} from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { RequirementTable } from "@/components/dashboard/requirement-table";

import {
  api,
  type ComparisonRequirement,
} from "@/lib/api";

export default function RequirementsPage() {
  const [release, setRelease] = useState("R2.4");
  const [requirements, setRequirements] = useState<ComparisonRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const loadRequirements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [healthResult, requirementsResult] =
        await Promise.allSettled([
          api.health(),
          api.getRequirements(release),
        ]);

      setConnected(healthResult.status === "fulfilled");

      if (requirementsResult.status === "rejected") {
        throw requirementsResult.reason;
      }

      // Backend returns:
      // {
      //   release: "R2.4",
      //   total: 12,
      //   providers: [...],
      //   requirements: [...]
      // }

      const response = requirementsResult.value;

      setRequirements(
        Array.isArray(response.requirements)
          ? response.requirements
          : []
      );
    } catch (err) {
      setRequirements([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load requirements."
      );
    } finally {
      setLoading(false);
    }
  }, [release]);

  useEffect(() => {
    void loadRequirements();
  }, [loadRequirements]);

  const stats = useMemo(() => {
    const agreed = requirements.filter(
      (item) => item.agree === true
    ).length;

    const disagreed = requirements.filter(
      (item) => item.agree === false
    ).length;

    const inconclusive =
      requirements.length - agreed - disagreed;

    return {
      total: requirements.length,
      agreed,
      disagreed,
      inconclusive,
    };
  }, [requirements]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-[260px] min-h-screen">
        <Header
          release={release}
          onReleaseChange={setRelease}
          onRefresh={loadRequirements}
          loading={loading}
          connected={connected}
        />

        <main className="space-y-7 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList
                  size={23}
                  className="text-indigo-600"
                />

                <h1 className="text-2xl font-bold text-gray-900">
                  Requirements
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Compare Jira requirement decisions across Gemini,
                OpenRouter and NVIDIA for {release}.
              </p>
            </div>

            <button
              onClick={loadRequirements}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
                Unable to load requirements
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Requirements"
              value={stats.total}
              description="Requirements in this release"
              icon={ClipboardList}
              iconColor="text-indigo-600"
              iconBackground="bg-indigo-50"
            />

            <StatCard
              title="Provider Agreement"
              value={stats.agreed}
              description="All providers returned the same decision"
              icon={CheckCircle2}
              iconColor="text-green-600"
              iconBackground="bg-green-50"
            />

            <StatCard
              title="Disagreement"
              value={stats.disagreed}
              description="Providers returned different decisions"
              icon={Users}
              iconColor="text-amber-600"
              iconBackground="bg-amber-50"
            />

            <StatCard
              title="Inconclusive"
              value={stats.inconclusive}
              description="No definitive agreement result"
              icon={AlertTriangle}
              iconColor="text-gray-600"
              iconBackground="bg-gray-100"
            />
          </section>

          {loading && requirements.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <RefreshCw
                size={25}
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading requirement comparison...
              </p>
            </div>
          ) : (
            <RequirementTable requirements={requirements} />
          )}
        </main>
      </div>
    </div>
  );
}
