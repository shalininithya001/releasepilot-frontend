
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  trend?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-gray-500">{description}</p>

        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-indigo-600">
            {trend}
            <ArrowUpRight size={13} />
          </span>
        )}
      </div>
    </div>
  );
}
