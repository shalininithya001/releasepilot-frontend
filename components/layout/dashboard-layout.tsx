
"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  connected?: boolean;
  onRefresh?: () => void;
}

export function DashboardLayout({
  children,
  loading = false,
  connected = false,
  onRefresh,
}: DashboardLayoutProps) {
  const [release, setRelease] = useState("R2.4");

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-[260px] min-h-screen">
        <Header
          release={release}
          onReleaseChange={setRelease}
          onRefresh={() => onRefresh?.()}
          loading={loading}
          connected={connected}
        />

        <main className="dashboard-scrollbar min-h-[calc(100vh-76px)] overflow-x-hidden p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
