import { Job } from "@/lib/admin";
import { Attempt, getAttemptDisplayAddress, getJobDisplayAddress } from "@/lib/attempts";

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearchQuery(
  query: string,
  fields: Array<string | null | undefined>,
): boolean {
  const normalized = normalizeSearchQuery(query);

  if (!normalized) {
    return true;
  }

  return fields.some((field) =>
    field?.toLowerCase().includes(normalized),
  );
}

export function filterJobsBySearch(
  jobs: Job[],
  query: string,
  attempts: Attempt[] = [],
): Job[] {
  if (!normalizeSearchQuery(query)) {
    return jobs;
  }

  return jobs.filter((job) =>
    matchesSearchQuery(query, [
      job.client,
      job.defendantName,
      getJobDisplayAddress(job.id, job.address, attempts),
      job.processServer,
    ]),
  );
}

export function filterAttemptsBySearch(
  attempts: Attempt[],
  query: string,
): Attempt[] {
  if (!normalizeSearchQuery(query)) {
    return attempts;
  }

  return attempts.filter((attempt) =>
    matchesSearchQuery(query, [
      attempt.defendantName,
      getAttemptDisplayAddress(attempt, attempts),
      attempt.processServerName,
    ]),
  );
}