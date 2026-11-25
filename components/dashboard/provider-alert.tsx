import { AlertTriangle, WifiOff } from "lucide-react";

interface ProviderAlertProps {
  providerIssue: boolean;
  providerMessage?: string;
}

export function ProviderAlert({
  providerIssue,
  providerMessage,
}: ProviderAlertProps) {
  if (!providerIssue) return null;

  return (
    <div className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <WifiOff size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-700" />
          <h3 className="text-sm font-semibold text-amber-900">
            AI Provider Issue — Assessment Incomplete
          </h3>
        </div>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          The AI provider is currently unavailable or has reached its API rate
          limit. Some requirements may not have been assessed.
        </p>

        {providerMessage && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-white/70 px-3 py-2">
            <p className="text-xs font-medium text-amber-900">
              Provider details
            </p>
            <p className="mt-1 break-words text-xs text-amber-800">
              {providerMessage}
            </p>
          </div>
        )}

        <p className="mt-3 text-xs font-medium text-amber-900">
          This is an infrastructure/provider issue, not automatically a
          product defect. Retry the assessment when the provider is available.
        </p>
      </div>
    </div>
  );
}