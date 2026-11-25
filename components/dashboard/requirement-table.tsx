
"use client";

import { useMemo, useState } from "react";
import { Search, X, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type Decision =
  | "PASS"
  | "FAIL"
  | "INSUFFICIENT_EVIDENCE"
  | "INSUFFICIENT_EVIDENCE*"
  | string;

interface ComparisonRequirement {
  requirement_id: string;
  title: string;
  decisions: {
    gemini?: Decision;
    openrouter?: Decision;
    nvidia?: Decision;
  };
  agree: boolean | null;
  majority: string | null;
}

interface RequirementTableProps {
  requirements?: ComparisonRequirement[];
}

const PROVIDERS = [
  { key: "gemini", label: "Gemini" },
  { key: "openrouter", label: "OpenRouter" },
  { key: "nvidia", label: "NVIDIA" },
] as const;

function normalizeDecision(decision?: Decision) {
  if (!decision) return "UNAVAILABLE";
  return decision.replace("*", "");
}

function DecisionCell({ decision }: { decision?: Decision }) {
  if (!decision) {
    return (
      <span className="text-xs text-gray-400">Not available</span>
    );
  }

  const normalized = normalizeDecision(decision);

  return (
    <div className="flex flex-col items-start gap-1">
      <StatusBadge status={normalized} />
      {decision.endsWith("*") && (
        <span className="text-[10px] text-amber-600">
          Provider interruption
        </span>
      )}
    </div>
  );
}

export function RequirementTable({
  requirements = [],
}: RequirementTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequirement, setSelectedRequirement] =
    useState<ComparisonRequirement | null>(null);

  const safeRequirements = Array.isArray(requirements)
    ? requirements
    : [];

  const filteredRequirements = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return safeRequirements.filter((item) => {
      const matchesSearch =
        item.requirement_id?.toLowerCase().includes(searchText) ||
        item.title?.toLowerCase().includes(searchText);

      const decisions = Object.values(item.decisions ?? {}).map(
        normalizeDecision
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AGREEMENT" && item.agree === true) ||
        (statusFilter === "DISAGREEMENT" && item.agree === false) ||
        decisions.includes(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [safeRequirements, search, statusFilter]);

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Requirement Comparison
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Compare assessment decisions across Gemini, OpenRouter and NVIDIA
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search requirements..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-400"
            >
              <option value="ALL">All requirements</option>
              <option value="PASS">Passed</option>
              <option value="FAIL">Failed</option>
              <option value="INSUFFICIENT_EVIDENCE">Insufficient evidence</option>
              <option value="AGREEMENT">Provider agreement</option>
              <option value="DISAGREEMENT">Provider disagreement</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Requirement
                </th>

                {PROVIDERS.map((provider) => (
                  <th
                    key={provider.key}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {provider.label}
                  </th>
                ))}

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Agreement
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredRequirements.map((item) => (
                <tr
                  key={item.requirement_id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.requirement_id}
                    </p>
                    <p className="mt-1 max-w-[260px] text-xs text-gray-500">
                      {item.title || "Untitled requirement"}
                    </p>
                  </td>

                  {PROVIDERS.map((provider) => (
                    <td key={provider.key} className="px-5 py-4">
                      <DecisionCell
                        decision={item.decisions?.[provider.key]}
                      />
                    </td>
                  ))}

                  <td className="px-5 py-4">
                    {item.agree === true ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                        <CheckCircle2 size={14} />
                        Agree
                      </span>
                    ) : item.agree === false ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                        <AlertCircle size={14} />
                        Disagree
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={14} />
                        Inconclusive
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedRequirement(item)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRequirements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      No requirements found
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500">
            Showing {filteredRequirements.length} of {safeRequirements.length} requirements
          </p>
        </div>
      </section>

      {selectedRequirement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedRequirement(null)}
        >
          <div
            className="w-full max-w-xl rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedRequirement.requirement_id}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRequirement.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequirement(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Provider decisions
              </h4>

              {PROVIDERS.map((provider) => (
                <div
                  key={provider.key}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {provider.label}
                  </span>

                  <DecisionCell
                    decision={
                      selectedRequirement.decisions?.[provider.key]
                    }
                  />
                </div>
              ))}

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  Majority decision
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedRequirement.majority ?? "No majority decision"}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                Provider agreement indicates whether the providers returned
                the same decision. Inconclusive results should not be treated
                as confirmed product failures.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
