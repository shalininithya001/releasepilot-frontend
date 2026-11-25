
"use client";

import { useCallback, useEffect, useState } from "react";
import {
    FileText,
    Download,
    Copy,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Loader2,
} from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { api, type AssessmentJob } from "@/lib/api";

export default function SubmissionPage() {
    const [release, setRelease] = useState("R2.4");
    const [jobId, setJobId] = useState("");
    const [job, setJob] = useState<AssessmentJob | null>(null);

    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const checkConnection = useCallback(async () => {
        try {
            await api.health();
            setConnected(true);
        } catch {
            setConnected(false);
        }
    }, []);

    useEffect(() => {
        void checkConnection();
    }, [checkConnection]);

    const generateReport = async () => {
        setLoading(true);
        setError("");
        setJob(null);
        setJobId("");
        setCopied(false);

        try {
            const result = await api.generateSubmission(release);

            setJobId(result.id);

            let currentStatus: AssessmentJob["status"] = result.status as AssessmentJob["status"];

            // Poll the backend until the assessment finishes.
            while (currentStatus === "running") {
                await new Promise((resolve) => setTimeout(resolve, 2000));

                const updatedJob = await api.getAssessmentJob(result.id);

                setJob(updatedJob);
                currentStatus = updatedJob.status;
            }

            if (currentStatus === "failed") {
                const failedJob = await api.getAssessmentJob(result.id);
                throw new Error(
                    failedJob.error || "Assessment execution failed."
                );
            }

            // Fetch the final result if it was not already stored.
            if (!job || currentStatus === "done") {
                const finalJob = await api.getAssessmentJob(result.id);
                setJob(finalJob);

                if (finalJob.status === "failed") {
                    throw new Error(
                        finalJob.error || "Assessment execution failed."
                    );
                }
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to generate assessment report."
            );
        } finally {
            setLoading(false);
        }
    };

    const reportText = job?.report
        ? JSON.stringify(job.report, null, 2)
        : "";

    const copyReport = async () => {
        if (!reportText) return;

        try {
            await navigator.clipboard.writeText(reportText);
            setCopied(true);
        } catch {
            setError("Unable to copy report. Please copy the result manually.");
        }
    };

    const downloadReport = () => {
        if (!reportText) return;

        const blob = new Blob([reportText], {
            type: "application/json;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${release}-assessment-report.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const report = job?.report;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="ml-[260px] min-h-screen">
                <Header
                    release={release}
                    onReleaseChange={(value) => {
                        setRelease(value);
                        setJob(null);
                        setJobId("");
                        setError("");
                        setCopied(false);
                    }}
                    onRefresh={checkConnection}
                    loading={loading}
                    connected={connected}
                />

                <main className="space-y-7 p-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileText size={23} className="text-indigo-600" />

                            <h1 className="text-2xl font-bold text-gray-900">
                                Submission Report
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Run a release assessment and review its final results.
                        </p>
                    </div>

                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Generate release assessment
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Start a new assessment for release {release}.
                                </p>
                            </div>

                            <button
                                onClick={generateReport}
                                disabled={loading || !connected}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={loading ? "animate-spin" : ""}
                                />

                                {loading ? "Assessment Running..." : "Start Assessment"}
                            </button>
                        </div>

                        {!connected && (
                            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                Backend is disconnected. Start the backend before running an assessment.
                            </p>
                        )}

                        {jobId && (
                            <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">
                                    Assessment Job ID
                                </p>

                                <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-800">
                                    {jobId}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3">
                                <AlertTriangle
                                    size={16}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                    </section>

                    {loading && (
                        <section className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Loader2
                                    size={22}
                                    className="animate-spin text-indigo-600"
                                />

                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Assessment in progress
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Waiting for the backend to complete the assessment...
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {job?.status === "done" && report && (
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            size={18}
                                            className="text-green-600"
                                        />

                                        <h2 className="text-base font-semibold text-gray-900">
                                            Assessment completed
                                        </h2>
                                    </div>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Final assessment results for {release}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={copyReport}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        <Copy size={14} />
                                        {copied ? "Copied" : "Copy"}
                                    </button>

                                    <button
                                        onClick={downloadReport}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                                    >
                                        <Download size={14} />
                                        Download JSON
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs text-gray-500">
                                        Overall Decision
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-gray-900">
                                        {String(report.overall_decision ?? "Unavailable")}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-green-50 p-4">
                                    <p className="text-xs text-green-700">Passed</p>
                                    <p className="mt-2 text-lg font-bold text-green-800">
                                        {report.decision_counts?.PASS ?? 0}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-red-50 p-4">
                                    <p className="text-xs text-red-700">Failed</p>
                                    <p className="mt-2 text-lg font-bold text-red-800">
                                        {report.decision_counts?.FAIL ?? 0}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-amber-50 p-4">
                                    <p className="text-xs text-amber-700">
                                        Insufficient Evidence
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-amber-800">
                                        {report.decision_counts?.INSUFFICIENT_EVIDENCE ?? 0}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <Clock size={14} />
                                    Raw assessment result
                                </div>

                                <pre className="dashboard-scrollbar max-h-[650px] overflow-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-5 font-mono text-xs leading-6 text-gray-700">
                                    {reportText}
                                </pre>
                            </div>
                        </section>
                    )}

                    {job?.status === "failed" && (
                        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-600" />

                                <h2 className="text-sm font-semibold text-red-800">
                                    Assessment failed
                                </h2>
                            </div>

                            <p className="mt-2 text-sm text-red-700">
                                {job.error || "The backend could not complete this assessment."}
                            </p>
                        </section>
                    )}

                    {!job && !loading && (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                            <FileText size={34} className="mx-auto text-gray-300" />

                            <h3 className="mt-4 text-sm font-semibold text-gray-700">
                                No assessment generated
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                                Select a release and click Start Assessment.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
