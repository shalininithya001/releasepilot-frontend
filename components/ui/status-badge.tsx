
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LoaderCircle,
  WifiOff,
} from "lucide-react";

type Status =
  | "PASS"
  | "FAIL"
  | "INSUFFICIENT_EVIDENCE"
  | "PENDING"
  | "IN_PROGRESS"
  | "API_LIMIT"
  | "DONE";

interface StatusBadgeProps {
  status: Status | string;
  showIcon?: boolean;
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  PASS: {
    label: "Passed",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  FAIL: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Incomplete",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertTriangle,
  },
  PENDING: {
    label: "Pending",
    className: "bg-slate-50 text-slate-600 border-slate-200",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: LoaderCircle,
  },
  API_LIMIT: {
    label: "API Rate Limit",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: WifiOff,
  },
  DONE: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
};

export function StatusBadge({
  status,
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status.replaceAll("_", " "),
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      {showIcon && <Icon size={13} />}
      {config.label}
    </span>
  );
}
