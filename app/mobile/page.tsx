// TODO: Re-implement proper User/Admin role separation with working login

"use client";

import AttemptForm, { type AttemptFlowStep } from "@/components/mobile/AttemptForm";
import { useToast } from "@/components/ToastProvider";
import JobList from "@/components/mobile/JobList";
import { Job } from "@/lib/admin";
import {
  applyDraftToJob,
  type AttemptDraft,
  createEmptyAttemptDraft,
  draftHasEnteredData,
} from "@/lib/attemptDraft";
import { getErrorMessage } from "@/lib/errors";
import { type AttemptType } from "@/lib/attempts";
import { fetchJobs } from "@/lib/jobs";
import { filterActiveJobs } from "@/lib/mobile";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function MobilePortal() {
  const { showError } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptFlowStep, setAttemptFlowStep] =
    useState<AttemptFlowStep>("form");
  const [attemptDraft, setAttemptDraft] = useState<AttemptDraft | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to load jobs from Supabase.",
      );
      setError(message);
      showError(message, "Could not load jobs");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => filterActiveJobs(jobs), [jobs]);

  function handleSelectJob(job: Job) {
    const nextDraft = attemptDraft
      ? applyDraftToJob(attemptDraft, job)
      : createEmptyAttemptDraft(job);

    setAttemptDraft(nextDraft);
    setSelectedJob(job);
    setAttemptFlowStep(nextDraft.flowStep);
  }

  function handleSelectDifferentJob(draft: AttemptDraft) {
    setAttemptDraft(draft);
    setSelectedJob(null);
    setAttemptFlowStep("form");
  }

  function handleBackFromAttempt() {
    setSelectedJob(null);
    setAttemptFlowStep("form");
    setAttemptDraft(null);
  }

  async function handleAttemptSaved(attemptType: AttemptType) {
    await loadJobs();

    if (attemptType === "success") {
      setSelectedJob((current) =>
        current ? { ...current, status: "Completed" } : current,
      );
    }
  }

  const attemptPageTitle =
    attemptFlowStep === "success"
      ? "Attempt Logged"
      : attemptFlowStep === "confirm"
        ? "Review & Send"
        : "Log Attempt";

  return (
    <main className="flex flex-1 flex-col bg-gray-50 px-4 py-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Bohn &amp; Associates
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {selectedJob ? attemptPageTitle : "Field Portal"}
          </h1>
        </header>

        {selectedJob ? (
          <AttemptForm
            job={selectedJob}
            serverName={selectedJob.processServer}
            initialDraft={attemptDraft}
            onBack={handleBackFromAttempt}
            onSelectDifferentJob={handleSelectDifferentJob}
            onFlowChange={setAttemptFlowStep}
            onAttemptSaved={handleAttemptSaved}
          />
        ) : (
          <section className="flex flex-1 flex-col">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">Jobs</h2>
              <p className="mt-1 text-sm text-gray-600">
                {filteredJobs.length} active job
                {filteredJobs.length === 1 ? "" : "s"} available
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {attemptDraft && draftHasEnteredData(attemptDraft) ? (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Your attempt details are saved. Select a job to continue where
                you left off.
              </div>
            ) : null}

            <JobList
              jobs={filteredJobs}
              loading={loading}
              serverName="available"
              onSelectJob={handleSelectJob}
            />
          </section>
        )}
      </div>
    </main>
  );
}