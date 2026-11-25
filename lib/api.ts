
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Decision =
  | "PASS"
  | "FAIL"
  | "INSUFFICIENT_EVIDENCE"
  | "INSUFFICIENT_EVIDENCE*"
  | string;

export type ProviderName = "gemini" | "openrouter" | "nvidia";

export interface ProviderSummary {
  available: boolean;
  model?: string;
  overall?: string;
  degraded?: boolean;
  incomplete?: number;
  wall_seconds?: number;
  tool_calls?: number;
  tokens?: number;
  counts?: Record<string, number>;
  message?: string;
}

export interface ReleaseSummary {
  release: string;
  project: string;
  dataset_label: string;
  providers: Record<ProviderName, ProviderSummary>;
  provider_order: ProviderName[];
  total_requirements: number;
}

export interface ComparisonRequirement {
  requirement_id: string;
  title: string;
  decisions: Partial<Record<ProviderName, Decision>>;
  agree: boolean | null;
  majority: string | null;
}

export interface RequirementsResponse {
  release: string;
  total: number;
  providers: ProviderName[];
  requirements: ComparisonRequirement[];
}

export interface ProviderUsage {
  calls?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  failures?: number;
}

export interface ProviderMetrics {
  wall_seconds?: number;
  tool_calls?: number;
  jira_api_calls?: number;
  jira_api_failures?: number;
  unique_issues_opened?: number;
  llm_usage?: ProviderUsage;
}

export interface ProviderReliability {
  available: boolean;
  overall_decision?: string;
  decision_counts?: Record<string, number>;
  incomplete_requirements?: number;
  degraded?: boolean;
  llm_failures?: unknown[];
  tool_errors?: unknown[];
  warnings?: unknown[];
  metrics?: ProviderMetrics;
}

export interface ProviderHealthResponse {
  release: string;
  providers: Record<ProviderName, ProviderReliability>;
}

export interface ProviderReportResponse {
  provider: ProviderName;
  release: string;
  report: Record<string, unknown>;
}

export interface SubmissionNote {
  markdown: string;
  generated_at: string;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const body = await response.json();
      message =
        typeof body.detail === "string"
          ? body.detail
          : JSON.stringify(body.detail ?? body);
    } catch {
      const text = await response.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export interface AssessmentJob {
  status: "running" | "done" | "failed";
  error?: string;
  report?: {
    overall_decision?: string;
    decision_counts?: Record<string, number>;
    target_release?: string;
    jira_project?: string;
    incomplete_requirements?: number;
    requirements?: unknown[];
    generated_at?: string;
  };
}

export const api = {
  getRelease: (release: string) =>
    request<ReleaseSummary>(
      `/api/releases/${encodeURIComponent(release)}`
    ),

  getRequirements: (release: string) =>
    request<RequirementsResponse>(
      `/api/releases/${encodeURIComponent(release)}/requirements`
    ),

  getProviders: (release: string) =>
    request<ProviderHealthResponse>(
      `/api/releases/${encodeURIComponent(release)}/providers`
    ),

  getProviderReport: (release: string, provider: ProviderName) =>
    request<ProviderReportResponse>(
      `/api/releases/${encodeURIComponent(release)}/providers/${provider}`
    ),

  generateSubmission: (release: string) =>
    request<{ id: string; status: string }>(
      `/api/releases/${encodeURIComponent(release)}/submission`,
      {
        method: "POST",
        body: JSON.stringify({ release }),
      }
    ),

   getAssessmentJob: (id: string) =>
    request<AssessmentJob>(
      `/api/v1/assessments/${encodeURIComponent(id)}`
    ),

  health: () =>
    request<{ status: string; service?: string }>("/health"),
};
