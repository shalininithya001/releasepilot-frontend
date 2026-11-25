
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface ReleaseProgressProps {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  incomplete: number;
  pending: number;
}

export function ReleaseProgress({
  total,
  completed,
  passed,
  failed,
  incomplete,
  pending,
}: ReleaseProgressProps) {
  const percentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const metrics = [
    {
      label: "Passed",
      value: passed,
      icon: CheckCircle2,
      color: "bg-green-500",
      text: "text-green-700",
    },
    {
      label: "Failed",
      value: failed,
      icon: XCircle,
      color: "bg-red-500",
      text: "text-red-700",
    },
    {
      label: "Incomplete",
      value: incomplete,
      icon: AlertTriangle,
      color: "bg-amber-500",
      text: "text-amber-700",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "bg-slate-400",
      text: "text-slate-600",
    },
  ];

  const segments = [
    { value: passed, color: "bg-green-500" },
    { value: failed, color: "bg-red-500" },
    { value: incomplete, color: "bg-amber-500" },
    { value: pending, color: "bg-slate-300" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Assessment Progress
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Requirement assessment completion
          </p>
        </div>

        <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700">
          {percentage}%
        </span>
      </div>

      <div className="mt-7 flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold tracking-tight text-gray-900">
            {completed}
            <span className="ml-1 text-xl font-medium text-gray-400">
              / {total}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Requirements assessed
          </p>
        </div>
      </div>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${segment.color} transition-all duration-500`}
            style={{
              width: `${total > 0 ? (segment.value / total) * 100 : 0}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label}>
              <div className="flex items-center gap-1.5">
                <Icon size={14} className={metric.text} />
                <span className="text-xs text-gray-500">
                  {metric.label}
                </span>
              </div>

              <p className={`mt-2 text-xl font-bold ${metric.text}`}>
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
