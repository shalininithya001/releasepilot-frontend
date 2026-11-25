
import {
  AlertCircle,
  Inbox,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

interface PageStateProps {
  type: "loading" | "error" | "empty";
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageState({
  type,
  title,
  message,
  onRetry,
}: PageStateProps) {
  const isLoading = type === "loading";
  const isError = type === "error";

  const Icon = isLoading
    ? LoaderCircle
    : isError
      ? AlertCircle
      : Inbox;

  const defaultTitle = isLoading
    ? "Loading..."
    : isError
      ? "Something went wrong"
      : "No data available";

  const defaultMessage = isLoading
    ? "Please wait while we fetch the information."
    : isError
      ? "We couldn't retrieve the requested information."
      : "There is currently nothing to display.";

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          isLoading
            ? "bg-indigo-50 text-indigo-600"
            : isError
              ? "bg-red-50 text-red-600"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon
          size={26}
          className={isLoading ? "animate-spin" : ""}
        />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-gray-900">
        {title || defaultTitle}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {message || defaultMessage}
      </p>

      {isError && onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}
