"use client";

import AttemptsTable from "@/components/admin/AttemptsTable";
import AdminNav, { AdminView } from "@/components/admin/AdminNav";
import { useToast } from "@/components/ToastProvider";
import CreateJobForm from "@/components/admin/CreateJobForm";
import DashboardOverview from "@/components/admin/DashboardOverview";
import JobsTable from "@/components/admin/JobsTable";
import ReportsSection from "@/components/admin/ReportsSection";
import { EditJobInput, Job, JobStatus, NewJobInput } from "@/lib/admin";
import { fetchAttempts, type Attempt } from "@/lib/attempts";
import { getErrorMessage } from "@/lib/errors";
import { createJob, fetchJobs, updateJob, updateJobStatus } from "@/lib/jobs";
import { useCallback, useEffect, useState } from "react";

export default function AdminPortal() {
  const { showError } = useToast();
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      showError(
        getErrorMessage(err, "Failed to load jobs from Supabase."),
        "Could not load jobs",
      );
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadAttempts = useCallback(async () => {
    setAttemptsLoading(true);

    try {
      const data = await fetchAttempts();
      setAttempts(data);
    } catch (err) {
      showError(
        getErrorMessage(err, "Failed to load attempts from Supabase."),
        "Could not load attempts",
      );
    } finally {
      setAttemptsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadJobs();
    void loadAttempts();
  }, [loadJobs, loadAttempts]);

  useEffect(() => {
    if (activeView === "attempts") {
      void loadAttempts();
    }
  }, [activeView, loadAttempts]);

  async function handleCreateJob(input: NewJobInput) {
    const newJob = await createJob(input);
    setJobs((prev) => [newJob, ...prev]);
    setActiveView("jobs");
  }

  async function handleUpdateJob(jobId: string, input: EditJobInput) {
    const updatedJob = await updateJob(jobId, input);
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? updatedJob : job)),
    );
  }

  async function handleUpdateJobStatus(jobId: string, status: JobStatus) {
    const updatedJob = await updateJobStatus(jobId, status);
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? updatedJob : job)),
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <AdminNav activeView={activeView} onViewChange={setActiveView} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading && activeView !== "attempts" && activeView !== "reports" ? (
          <p className="text-sm text-gray-600">Loading jobs...</p>
        ) : null}
        {attemptsLoading && activeView === "attempts" ? (
          <p className="text-sm text-gray-600">Loading attempts...</p>
        ) : null}

        {activeView === "dashboard" && !loading ? (
          <DashboardOverview jobs={jobs} />
        ) : null}
        {activeView === "create" ? (
          <CreateJobForm onCreateJob={handleCreateJob} />
        ) : null}
        {activeView === "jobs" && !loading && !attemptsLoading ? (
          <JobsTable
            jobs={jobs}
            attempts={attempts}
            onUpdateJob={handleUpdateJob}
            onUpdateJobStatus={handleUpdateJobStatus}
          />
        ) : null}
        {activeView === "attempts" && !attemptsLoading ? (
          <AttemptsTable attempts={attempts} />
        ) : null}
        {activeView === "reports" ? <ReportsSection /> : null}
      </main>
    </div>
  );
}