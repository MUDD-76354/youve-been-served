import { emptyStatePresets, EmptyStateFromPreset } from "@/components/EmptyState";
import { statusStyles } from "@/components/mobile/constants";
import { Job } from "@/lib/admin";

type JobListProps = {
  jobs: Job[];
  loading: boolean;
  serverName: string;
  onSelectJob: (job: Job) => void;
};

export default function JobList({
  jobs,
  loading,
  serverName,
  onSelectJob,
}: JobListProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-gray-600">Loading your jobs...</p>
      </div>
    );
  }

  if (!serverName.trim()) {
    return (
      <EmptyStateFromPreset
        preset={emptyStatePresets.mobileEnterName}
        className="border-gray-200 bg-white shadow-sm"
      />
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyStateFromPreset
        preset={emptyStatePresets.mobileNoJobs}
        className="border-gray-200 bg-white shadow-sm"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <button
            type="button"
            onClick={() => onSelectJob(job)}
            className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-gray-900">{job.defendantName}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {job.address}
                </p>
                <p className="mt-3 line-clamp-2 text-xs text-gray-500">
                  {job.documentsToServe}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status]}`}
              >
                {job.status}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-blue-600">
              Tap to log attempt →
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}