import { Job } from "@/lib/admin";
import { Attempt } from "@/lib/attempts";

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

export function filterJobsBySearch(jobs: Job[], query: string): Job[] {
  if (!normalizeSearchQuery(query)) {
    return jobs;
  }

  return jobs.filter((job) =>
    matchesSearchQuery(query, [
      job.defendantName,
      job.address,
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
      attempt.jobAddress,
      attempt.address,
      attempt.processServerName,
    ]),
  );
}