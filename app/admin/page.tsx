// TODO: Re-implement proper User/Admin role separation with working login

"use client";

import AttemptsTable from "@/components/admin/AttemptsTable";
import AdminNav, { AdminView } from "@/components/admin/AdminNav";
import CreateJobForm from "@/components/admin/CreateJobForm";
import CreateUserForm from "@/components/admin/CreateUserForm";
import ManageUsersSection from "@/components/admin/ManageUsersSection";
import DashboardOverview from "@/components/admin/DashboardOverview";
import CompletedJobsTable from "@/components/admin/CompletedJobsTable";
import JobsTable from "@/components/admin/JobsTable";
import ReportsSection from "@/components/admin/ReportsSection";
import { emptyStatePresets } from "@/components/EmptyState";
import { useToast } from "@/components/ToastProvider";
import {
  EditJobInput,
  filterActiveJobs,
  filterCompletedJobs,
  Job,
  JobStatus,
  NewJobInput,
} from "@/lib/admin";
import {
  EditAttemptInput,
  fetchAttempts,
  updateAttempt,
  type Attempt,
} from "@/lib/attempts";
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

  async function handleUpdateAttempt(
    attemptId: string,
    input: EditAttemptInput,
  ) {
    const updatedAttempt = await updateAttempt(attemptId, input);
    setAttempts((prev) =>
      prev.map((attempt) =>
        attempt.id === attemptId ? updatedAttempt : attempt,
      ),
    );
  }

  const activeJobs = filterActiveJobs(jobs);
  const completedJobs = filterCompletedJobs(jobs);

  return (
      <div className="min-h-full bg-gray-50">
        <AdminNav activeView={activeView} onViewChange={setActiveView} />

        <main className="mx-auto max-w-6xl px-6 py-8">
        {loading &&
        activeView !== "attempts" &&
        activeView !== "reports" &&
        activeView !== "createUser" &&
        activeView !== "manageUsers" ? (
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
        {activeView === "createUser" ? <CreateUserForm /> : null}
        {activeView === "manageUsers" ? <ManageUsersSection /> : null}
        {activeView === "jobs" && !loading && !attemptsLoading ? (
          <JobsTable
            jobs={activeJobs}
            attempts={attempts}
            onUpdateJob={handleUpdateJob}
            onUpdateJobStatus={handleUpdateJobStatus}
          />
        ) : null}
        {activeView === "completed" && !loading && !attemptsLoading ? (
          <CompletedJobsTable
            jobs={completedJobs}
            attempts={attempts}
            onUpdateJob={handleUpdateJob}
            onUpdateJobStatus={handleUpdateJobStatus}
            onUpdateAttempt={handleUpdateAttempt}
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