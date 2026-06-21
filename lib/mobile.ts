import { Job } from "@/lib/admin";

export const SERVER_NAME_STORAGE_KEY = "youve-been-served-server-name";

export function getStoredServerName(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(SERVER_NAME_STORAGE_KEY) ?? "";
}

export function storeServerName(name: string): void {
  localStorage.setItem(SERVER_NAME_STORAGE_KEY, name);
}

export function filterActiveJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.status !== "Completed");
}

export function filterJobsForServer(jobs: Job[], serverName: string): Job[] {
  const normalizedServerName = serverName.trim().toLowerCase();

  if (!normalizedServerName) {
    return [];
  }

  return jobs.filter(
    (job) =>
      job.processServer.trim().toLowerCase() === normalizedServerName &&
      job.status !== "Completed",
  );
}

export function getServerNameSuggestions(jobs: Job[]): string[] {
  const names = new Set<string>();

  for (const job of jobs) {
    const name = job.processServer.trim();
    if (name) {
      names.add(name);
    }
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}