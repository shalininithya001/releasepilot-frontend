
"use client";

import {
  X,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Clock,
  Users,
} from "lucide-react";

import type {
  ComparisonRequirement,
  ProviderName,
} from "@/lib/api";

import { StatusBadge } from "@/components/ui/status-badge";

interface RequirementDetailsProps {
  requirement: ComparisonRequirement | null;
  onClose: () => void;
}

const PROVIDERS: {
  key: ProviderName;
  label: string;
}[] = [
  { key: "gemini", label: "Gemini" },
  { key: "openrouter", label: "OpenRouter" },
  { key: "nvidia", label: "NVIDIA" },
];

function normalizeDecision(decision?: string) {
  return decision?.replace("*", "") || "UNAVAILABLE";
}

export function RequirementDetails({
  requirement,
  onClose,
}: RequirementDetailsProps) {
  if (!requirement) return null;

  const decisions = requirement.decisions ?? {};

  const hasInterruption = Object.values(decisions).some(
    (decision) => decision?.endsWith("*")
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Requirement details
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {requirement.requirement_id}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close requirement details"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-900">
              Requirement information
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {requirement.title || "No requirement title available."}
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <Users size={17} className="text-indigo-600" />

              <h3 className="text-sm font-semibold text-gray-900">
                Provider assessment comparison
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {PROVIDERS.map((provider) => {
                const decision = decisions[provider.key];

                return (
                  <div
                    key={provider.key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {provider.label}
                      </p>

                      {decision?.endsWith("*") && (
                        <p className="mt-1 text-xs text-amber-600">
                          Provider interruption
                        </p>
                      )}
                    </div>

                    {decision ? (
                      <StatusBadge
                        status={normalizeDecision(decision)}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">
                        Not available
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Comparison result
            </h3>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-gray-600">
                Provider agreement
              </span>

              {requirement.agree === true ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={15} />
                  Agreement
                </span>
              ) : requirement.agree === false ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                  <AlertCircle size={15} />
                  Disagreement
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                  <Clock size={15} />
                  Inconclusive
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-gray-600">
                Majority decision
              </span>

              <span className="text-sm font-semibold text-gray-900">
                {requirement.majority ?? "No majority decision"}
              </span>
            </div>
          </section>

          {hasInterruption && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <p className="text-xs leading-5 text-amber-800">
                  One or more provider results were marked with an
                  interruption indicator. An insufficient-evidence
                  result caused by provider unavailability should not
                  automatically be treated as a confirmed product failure.
                </p>
              </div>
            </div>
          )}

          <section className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <FileSearch size={16} className="text-indigo-600" />

              <h3 className="text-sm font-semibold text-gray-900">
                Assessment evidence
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Detailed rationale, evidence and outstanding items are
              available in each provider's original report.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
