"use client";

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import {
  emptyStatePresets,
  EmptyStateFromPreset,
  type EmptyStatePreset,
} from "@/components/EmptyState";
import JobDetailsModal from "@/components/admin/JobDetailsModal";
import EditJobForm from "@/components/admin/EditJobForm";
import JobStatusSelect from "@/components/admin/JobStatusSelect";
import { EditJobInput, Job, JobStatus } from "@/lib/admin";
import { Attempt } from "@/lib/attempts";
import { filterJobsBySearch } from "@/lib/search";
import { useMemo, useState } from "react";

type JobsTableProps = {
  jobs: Job[];
  attempts: Attempt[];
  onUpdateJob: (jobId: string, input: EditJobInput) => Promise<void>;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  title?: string;
  description?: string;
  emptyPreset?: EmptyStatePreset;
  emptySearchPreset?: EmptyStatePreset;
};

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobsTable({
  jobs,
  attempts,
  onUpdateJob,
  onUpdateJobStatus,
  title = "Jobs List",
  description = "Track assignments, change status from the list, view attempt photos, and edit jobs.",
  emptyPreset = emptyStatePresets.adminNoJobs,
  emptySearchPreset = emptyStatePresets.adminNoJobsSearch,
}: JobsTableProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(
    () => filterJobsBySearch(jobs, searchQuery),
    [jobs, searchQuery],
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

  async function handleSave(jobId: string, input: EditJobInput) {
    await onUpdateJob(jobId, input);
    setEditingJob(null);
  }

  const showEmptyState = jobs.length === 0 || filteredJobs.length === 0;
  const jobsEmptyPreset =
    jobs.length === 0 ? emptyPreset : emptySearchPreset;

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
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
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
                  <th className="px-4 py-3 font-semibold text-gray-700">Subject Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Address</th>
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

                  return (
                    <tr key={job.id} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-4 text-gray-600">
                        {job.client || "—"}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {job.defendantName}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-gray-600">{job.address}</td>
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
                          <button
                            type="button"
                            onClick={() => setEditingJob(job)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
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
          onSave={handleSave}
          onCancel={() => setEditingJob(null)}
        />
      ) : null}
    </section>
  );
}