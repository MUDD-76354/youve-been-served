"use client";

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import EditAttemptForm from "@/components/admin/EditAttemptForm";
import EditJobForm from "@/components/admin/EditJobForm";
import JobDetailsModal from "@/components/admin/JobDetailsModal";
import JobStatusSelect from "@/components/admin/JobStatusSelect";
import {
  emptyStatePresets,
  EmptyStateFromPreset,
} from "@/components/EmptyState";
import { EditJobInput, Job, JobStatus } from "@/lib/admin";
import {
  Attempt,
  EditAttemptInput,
  formatServiceDate,
  formatServiceTime,
  getJobDisplayAddress,
  getSuccessfulAttemptForJob,
} from "@/lib/attempts";
import { filterJobsBySearch } from "@/lib/search";
import { useMemo, useState } from "react";

type CompletedJobsTableProps = {
  jobs: Job[];
  attempts: Attempt[];
  onUpdateJob: (jobId: string, input: EditJobInput) => Promise<void>;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  onUpdateAttempt: (attemptId: string, input: EditAttemptInput) => Promise<void>;
};

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CompletedJobsTable({
  jobs,
  attempts,
  onUpdateJob,
  onUpdateJobStatus,
  onUpdateAttempt,
}: CompletedJobsTableProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingAttempt, setEditingAttempt] = useState<{
    attempt: Attempt;
    subjectName: string;
  } | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(
    () => filterJobsBySearch(jobs, searchQuery, attempts),
    [jobs, searchQuery, attempts],
  );

  const photoCountByJob = useMemo(() => {
    const counts = new Map<string, number>();

    for (const attempt of attempts) {
      if (!attempt.photoUrl) {
        continue;
      }

      counts.set(attempt.jobId, (counts.get(attempt.jobId) ?? 0) + 1);
    }

    return counts;
  }, [attempts]);

  const showEmptyState = jobs.length === 0 || filteredJobs.length === 0;
  const jobsEmptyPreset =
    jobs.length === 0
      ? emptyStatePresets.adminNoCompletedJobs
      : emptyStatePresets.adminNoCompletedJobsSearch;

  async function handleSaveJob(jobId: string, input: EditJobInput) {
    await onUpdateJob(jobId, input);
    setEditingJob(null);
  }

  async function handleSaveAttempt(attemptId: string, input: EditAttemptInput) {
    await onUpdateAttempt(attemptId, input);
    setEditingAttempt(null);
  }

  async function handleStatusChange(jobId: string, status: JobStatus) {
    await onUpdateJobStatus(jobId, status);
    setViewingJob((current) =>
      current?.id === jobId ? { ...current, status } : current,
    );
    setEditingJob((current) =>
      current?.id === jobId ? { ...current, status } : current,
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Completed Jobs</h2>
        <p className="mt-1 text-sm text-gray-600">
          Jobs marked Completed after a successful serve was logged on Mobile.
          Correct service date and time when needed.
        </p>
      </div>

      <AdminSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={filteredJobs.length}
        totalCount={jobs.length}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {showEmptyState ? (
          <div className="p-6">
            <EmptyStateFromPreset
              preset={jobsEmptyPreset}
              className="border-0 bg-transparent"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Client</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Subject Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Address</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Service Date
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Service Time
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Documents</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Server</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Photos</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((job) => {
                  const photoCount = photoCountByJob.get(job.id) ?? 0;
                  const displayAddress = getJobDisplayAddress(
                    job.id,
                    job.address,
                    attempts,
                  );
                  const successfulAttempt = getSuccessfulAttemptForJob(
                    job.id,
                    attempts,
                  );

                  return (
                    <tr key={job.id} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-600">
                        {job.client || "—"}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {job.defendantName}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {displayAddress}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {successfulAttempt
                          ? formatServiceDate(successfulAttempt.createdAt)
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {successfulAttempt
                          ? formatServiceTime(successfulAttempt.createdAt)
                          : "—"}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-gray-600">
                        {job.documentsToServe}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{job.processServer}</td>
                      <td className="px-4 py-4">
                        <JobStatusSelect
                          jobId={job.id}
                          status={job.status}
                          onStatusChange={handleStatusChange}
                        />
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {photoCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewingJob(job)}
                            className="font-semibold text-blue-600 transition hover:text-blue-800"
                          >
                            {photoCount} photo{photoCount === 1 ? "" : "s"}
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {formatCreatedAt(job.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingJob(job)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            View
                          </button>
                          {successfulAttempt ? (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingAttempt({
                                  attempt: successfulAttempt,
                                  subjectName: job.defendantName,
                                })
                              }
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                              Edit Attempt
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setEditingJob(job)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit Job
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingJob ? (
        <JobDetailsModal
          job={viewingJob}
          attempts={attempts}
          onClose={() => setViewingJob(null)}
        />
      ) : null}

      {editingJob ? (
        <EditJobForm
          job={editingJob}
          onSave={handleSaveJob}
          onCancel={() => setEditingJob(null)}
        />
      ) : null}

      {editingAttempt ? (
        <EditAttemptForm
          attempt={editingAttempt.attempt}
          subjectName={editingAttempt.subjectName}
          onSave={handleSaveAttempt}
          onCancel={() => setEditingAttempt(null)}
        />
      ) : null}
    </section>
  );
}