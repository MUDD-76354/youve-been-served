export const JOB_STATUSES = [
  "Assigned",
  "In Progress",
  "On Hold",
  "Completed",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const jobStatusStyles: Record<JobStatus, string> = {
  Assigned: "bg-blue-100 text-blue-800",
  "In Progress": "bg-amber-100 text-amber-800",
  "On Hold": "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
};

export type Job = {
  id: string;
  defendantName: string;
  address: string;
  documentsToServe: string;
  processServer: string;
  status: JobStatus;
  createdAt: string;
  attemptsToday: number;
};

export type NewJobInput = {
  defendantName: string;
  address: string;
  documentsToServe: string;
  processServer: string;
};

export type EditJobInput = NewJobInput & {
  status: JobStatus;
};

export function getDashboardStats(jobs: Job[]) {
  const openJobs = jobs.filter((job) => job.status !== "Completed");
  const attemptsToday = jobs.reduce((total, job) => total + job.attemptsToday, 0);

  return {
    totalOpenJobs: openJobs.length,
    attemptsToday,
    assignedCount: jobs.filter((job) => job.status === "Assigned").length,
    inProgressCount: jobs.filter((job) => job.status === "In Progress").length,
    onHoldCount: jobs.filter((job) => job.status === "On Hold").length,
    completedCount: jobs.filter((job) => job.status === "Completed").length,
  };
}