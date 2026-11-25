
"use client";

import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Settings,
  Activity,
  ShieldCheck,
  Rocket,
  ChevronLeft,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Requirements",
    href: "/requirements",
    icon: ClipboardCheck,
  },
  {
    label: "Submission Report",
    href: "/submission",
    icon: FileText,
  },
];

const management = [
  {
    label: "Provider Status",
    href: "/providers",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-gray-800 bg-[#111827] text-white">
      {/* Brand */}
      <div className="flex h-[76px] items-center gap-3 border-b border-gray-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <Rocket size={21} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            ReleasePilot
          </h1>
          <p className="text-[11px] text-gray-400">
            Release Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-7 dashboard-scrollbar">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-500">
          System
        </p>

        <nav className="space-y-1">
          {management.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom status */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-800/70 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <ShieldCheck size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white">
              Assessment Engine
            </p>
            <p className="text-[10px] text-gray-400">
              Dashboard connected
            </p>
          </div>

          <div className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        <p className="mt-4 text-center text-[10px] text-gray-600">
          ReleasePilot v1.0.0
        </p>
      </div>
    </aside>
  );
}
