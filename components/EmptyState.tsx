import { type ReactNode } from "react";

export type EmptyStateIcon =
  | "briefcase"
  | "clipboard"
  | "search"
  | "filter"
  | "user"
  | "camera"
  | "inbox";

export type EmptyStatePreset = {
  title: string;
  description: string;
  icon: EmptyStateIcon;
};

export const emptyStatePresets = {
  adminNoJobs: {
    title: "No jobs yet",
    description:
      "Create your first job using the Create Job tab in the navigation above.",
    icon: "briefcase",
  },
  adminNoJobsSearch: {
    title: "No matching jobs",
    description:
      "Try searching by a different defendant name, address, or process server. You can also clear the search to see all jobs.",
    icon: "search",
  },
  adminNoAttempts: {
    title: "No attempts logged yet",
    description:
      "Attempts will appear here once process servers log serves from the Mobile portal.",
    icon: "clipboard",
  },
  adminNoAttemptsSearch: {
    title: "No matching attempts",
    description:
      "Try a different defendant name, address, or process server. Clear the search bar to see all attempts.",
    icon: "search",
  },
  adminNoAttemptsFilter: {
    title: "No attempts match your filters",
    description:
      "Adjust the date range, server, outcome, or attempt type filters above, or clear filters to see all attempts.",
    icon: "filter",
  },
  adminNoAttemptsFilterAndSearch: {
    title: "No results found",
    description:
      "Nothing matches your current filters and search. Try broadening the filters or clearing the search bar.",
    icon: "search",
  },
  mobileEnterName: {
    title: "Enter your name to get started",
    description:
      "Select or type your process server name above. Your assigned jobs will appear here.",
    icon: "user",
  },
  mobileNoJobs: {
    title: "No jobs assigned to you",
    description:
      "Check back later, or confirm your name matches what the office used when creating the job.",
    icon: "briefcase",
  },
  modalNoPhotos: {
    title: "No photos yet",
    description:
      "Photos uploaded with mobile attempts will show up here for this job.",
    icon: "camera",
  },
  modalNoAttempts: {
    title: "No attempts for this job",
    description:
      "When a process server logs an attempt on mobile, the history will appear here.",
    icon: "clipboard",
  },
} as const satisfies Record<string, EmptyStatePreset>;

type EmptyStateProps = EmptyStatePreset & {
  size?: "default" | "compact";
  className?: string;
  action?: ReactNode;
};

function EmptyStateIconGraphic({
  icon,
  compact,
}: {
  icon: EmptyStateIcon;
  compact: boolean;
}) {
  const sizeClass = compact ? "h-10 w-10" : "h-12 w-12";
  const iconClass = compact ? "h-5 w-5" : "h-6 w-6";

  const paths: Record<EmptyStateIcon, ReactNode> = {
    briefcase: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    ),
    clipboard: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C6.095 4.01 5.25 4.973 5.25 6.108V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V8.084c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08"
      />
    ),
    search: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z"
      />
    ),
    filter: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
      />
    ),
    user: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    ),
    camera: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.719-2.22-.377-.063-.754-.12-1.134-.175a2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
    ),
    inbox: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    ),
  };

  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ${sizeClass}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={iconClass}
        aria-hidden="true"
      >
        {paths[icon]}
      </svg>
    </div>
  );
}

export default function EmptyState({
  title,
  description,
  icon,
  size = "default",
  className = "",
  action,
}: EmptyStateProps) {
  const compact = size === "compact";

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 px-6 text-center ${
        compact ? "py-8" : "py-12"
      } ${className}`}
    >
      <EmptyStateIconGraphic icon={icon} compact={compact} />
      <h3
        className={`mt-4 font-semibold text-gray-900 ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 max-w-md leading-relaxed text-gray-600 ${
          compact ? "text-sm" : "text-sm sm:text-base"
        }`}
      >
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function EmptyStateFromPreset({
  preset,
  size = "default",
  className = "",
  action,
}: {
  preset: EmptyStatePreset;
  size?: "default" | "compact";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <EmptyState
      {...preset}
      size={size}
      className={className}
      action={action}
    />
  );
}