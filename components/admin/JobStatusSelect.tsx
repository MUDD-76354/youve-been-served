"use client";

import { useToast } from "@/components/ToastProvider";
import { JOB_STATUSES, jobStatusStyles, JobStatus } from "@/lib/admin";
import { getErrorMessage } from "@/lib/errors";
import { ChangeEvent, useState } from "react";

type JobStatusSelectProps = {
  jobId: string;
  status: JobStatus;
  onStatusChange: (jobId: string, status: JobStatus) => Promise<void>;
  disabled?: boolean;
};

export default function JobStatusSelect({
  jobId,
  status,
  onStatusChange,
  disabled = false,
}: JobStatusSelectProps) {
  const { showSuccess, showError } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as JobStatus;

    if (nextStatus === status) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await onStatusChange(jobId, nextStatus);
      showSuccess(`Job status changed to ${nextStatus}.`, "Status updated");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update job status.");
      setError(message);
      showError(message, "Could not update status");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="min-w-[9.5rem]">
      <label className="sr-only" htmlFor={`job-status-${jobId}`}>
        Change job status
      </label>
      <select
        id={`job-status-${jobId}`}
        value={status}
        onChange={(event) => void handleChange(event)}
        disabled={disabled || isUpdating}
        className={`w-full cursor-pointer rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-60 ${jobStatusStyles[status]}`}
      >
        {JOB_STATUSES.map((option) => (
          <option key={option} value={option}>
            {isUpdating && option === status ? "Updating..." : option}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}