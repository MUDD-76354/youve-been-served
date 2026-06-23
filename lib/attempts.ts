import { updateJobStatus } from "@/lib/jobs";
import { supabase } from "@/lib/supabase";

export type AttemptType = "success" | "failed";

export const ATTEMPT_OUTCOMES = [
  "Successful Serve",
  "Failed Attempt",
] as const;

export const SERVE_TYPES = [
  "Personal Service",
  "Substituted Service",
  "Posted Service",
  "Corporate/Registered Agent",
] as const;

export type AttemptFilters = {
  startDate?: string;
  endDate?: string;
  processServerName?: string;
  client?: string;
  outcome?: string;
  typeOfServe?: string;
};

export type SuccessAttemptInput = {
  serveType: string;
  personServed: string;
  address: string;
  mileage: string;
  notes: string;
};

export type FailedAttemptInput = {
  address: string;
  dateTime: string;
  mileage: string;
  notes: string;
};

export type EditAttemptInput = {
  serviceDate: string;
  serviceTime: string;
  editNote: string;
};

export function getJobDisplayAddress(
  jobId: string,
  jobAddress: string,
  attempts: Attempt[],
): string {
  let latestAttempt: Attempt | null = null;

  for (const attempt of attempts) {
    if (attempt.jobId !== jobId) {
      continue;
    }

    if (
      !latestAttempt ||
      new Date(attempt.createdAt).getTime() >
        new Date(latestAttempt.createdAt).getTime()
    ) {
      latestAttempt = attempt;
    }
  }

  const attemptAddress = latestAttempt?.address?.trim();

  return attemptAddress || jobAddress;
}

export function getSuccessfulAttemptForJob(
  jobId: string,
  attempts: Attempt[],
): Attempt | null {
  let latestAttempt: Attempt | null = null;

  for (const attempt of attempts) {
    if (
      attempt.jobId !== jobId ||
      attempt.attemptType !== "Successful Serve"
    ) {
      continue;
    }

    if (
      !latestAttempt ||
      new Date(attempt.createdAt).getTime() >
        new Date(latestAttempt.createdAt).getTime()
    ) {
      latestAttempt = attempt;
    }
  }

  return latestAttempt;
}

export function formatServiceDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatServiceTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toServiceDateInputValue(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toServiceTimeInputValue(value: string): string {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export type Attempt = {
  id: string;
  jobId: string;
  defendantName: string;
  jobAddress: string | null;
  jobDocuments: string | null;
  jobStatus: string | null;
  processServerName: string;
  attemptType: string;
  typeOfServe: string | null;
  personServedName: string | null;
  address: string | null;
  mileage: number | null;
  notes: string | null;
  editNotes: string;
  photoUrl: string | null;
  createdAt: string;
};

export function getAttemptDisplayAddress(
  attempt: Attempt,
  attempts: Attempt[],
): string {
  return getJobDisplayAddress(
    attempt.jobId,
    attempt.jobAddress ?? "",
    attempts,
  );
}

type JobSummary = {
  id: string;
  defendant_name: string;
  address: string;
  documents: string;
  status: string;
};

type AttemptRow = {
  id: string;
  job_id: string;
  process_server_name: string;
  attempt_type: string;
  type_of_serve: string | null;
  person_served_name: string | null;
  address: string | null;
  mileage: number | null;
  notes: string | null;
  edit_notes: string | null;
  photo_url: string | null;
  created_at: string;
};

function mapAttemptRow(
  row: AttemptRow,
  job?: JobSummary | null,
): Attempt {
  return {
    id: row.id,
    jobId: row.job_id,
    defendantName: job?.defendant_name ?? "Unknown",
    jobAddress: job?.address ?? null,
    jobDocuments: job?.documents ?? null,
    jobStatus: job?.status ?? null,
    processServerName: row.process_server_name,
    attemptType: row.attempt_type,
    typeOfServe: row.type_of_serve,
    personServedName: row.person_served_name,
    address: row.address,
    mileage: row.mileage,
    notes: row.notes,
    editNotes: row.edit_notes ?? "",
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

function parseMileage(value: string): number {
  return Number.parseFloat(value);
}

const attemptSelectBase =
  "id, job_id, process_server_name, attempt_type, type_of_serve, person_served_name, address, mileage, notes, edit_notes, created_at";

function startOfDayIso(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}

function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyAttemptFilters(query: any, filters?: AttemptFilters) {
  if (!filters) {
    return query;
  }

  let filtered = query;

  if (filters.startDate) {
    filtered = filtered.gte("created_at", startOfDayIso(filters.startDate));
  }

  if (filters.endDate) {
    filtered = filtered.lte("created_at", endOfDayIso(filters.endDate));
  }

  if (filters.processServerName) {
    filtered = filtered.eq("process_server_name", filters.processServerName);
  }

  if (filters.outcome) {
    filtered = filtered.eq("attempt_type", filters.outcome);
  }

  if (filters.typeOfServe) {
    filtered = filtered.eq("type_of_serve", filters.typeOfServe);
  }

  return filtered;
}

async function fetchJobIdsForClientFilter(
  client: string,
): Promise<string[] | null> {
  const trimmedClient = client.trim();

  if (!trimmedClient) {
    return null;
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id, client");

  if (error) {
    throw new Error(error.message);
  }

  const normalizedClient = trimmedClient.toLowerCase();

  return (
    (data as Array<{ id: string; client: string | null }> | null) ?? []
  )
    .filter((job) =>
      job.client?.toLowerCase().includes(normalizedClient),
    )
    .map((job) => job.id);
}

function applyClientJobFilter<T>(query: T, jobIds: string[] | null): T {
  if (!jobIds) {
    return query;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (query as any).in("job_id", jobIds);
}

async function fetchAttemptRows(filters?: AttemptFilters): Promise<AttemptRow[]> {
  const clientJobIds = filters?.client
    ? await fetchJobIdsForClientFilter(filters.client)
    : null;

  if (clientJobIds && clientJobIds.length === 0) {
    return [];
  }

  const withPhotoQuery = applyClientJobFilter(
    applyAttemptFilters(
      supabase
        .from("attempts")
        .select(`${attemptSelectBase}, photo_url`)
        .order("created_at", { ascending: false }),
      filters,
    ),
    clientJobIds,
  );
  const withPhotoResult = await withPhotoQuery;

  if (!withPhotoResult.error) {
    return (withPhotoResult.data as AttemptRow[]) ?? [];
  }

  if (!withPhotoResult.error.message.includes("photo_url")) {
    throw new Error(withPhotoResult.error.message);
  }

  const withoutPhotoQuery = applyClientJobFilter(
    applyAttemptFilters(
      supabase
        .from("attempts")
        .select(attemptSelectBase)
        .order("created_at", { ascending: false }),
      filters,
    ),
    clientJobIds,
  );
  const withoutPhotoResult = await withoutPhotoQuery;

  if (withoutPhotoResult.error) {
    throw new Error(withoutPhotoResult.error.message);
  }

  return ((withoutPhotoResult.data as Omit<AttemptRow, "photo_url">[]) ?? []).map(
    (row) => ({ ...row, photo_url: null }),
  );
}

async function attachJobDetails(attemptRows: AttemptRow[]): Promise<Attempt[]> {
  const jobsResult = await supabase
    .from("jobs")
    .select("id, defendant_name, address, documents, status");

  if (jobsResult.error) {
    throw new Error(jobsResult.error.message);
  }

  const jobsById = new Map(
    (jobsResult.data as JobSummary[] | null)?.map((job) => [job.id, job]) ?? [],
  );

  return attemptRows.map((row) => mapAttemptRow(row, jobsById.get(row.job_id)));
}

export async function fetchAttempts(): Promise<Attempt[]> {
  return attachJobDetails(await fetchAttemptRows());
}

export async function fetchFilteredAttempts(
  filters: AttemptFilters,
): Promise<Attempt[]> {
  return attachJobDetails(await fetchAttemptRows(filters));
}

export async function fetchProcessServerNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select("process_server_name");

  if (error) {
    throw new Error(error.message);
  }

  const names = new Set<string>();

  for (const row of data ?? []) {
    const name = (row as { process_server_name: string | null })
      .process_server_name;

    if (name) {
      names.add(name);
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

function withOptionalPhotoUrl<T extends Record<string, unknown>>(
  payload: T,
  photoUrl: string | null,
): T & { photo_url?: string } {
  if (!photoUrl) {
    return payload;
  }

  return { ...payload, photo_url: photoUrl };
}

export async function saveAttempt(
  jobId: string,
  processServerName: string,
  attemptType: AttemptType,
  data: SuccessAttemptInput | FailedAttemptInput,
  photoUrl: string | null = null,
): Promise<Attempt> {
  if (attemptType === "success") {
    const successData = data as SuccessAttemptInput;

    const { data: row, error } = await supabase
      .from("attempts")
      .insert(
        withOptionalPhotoUrl(
          {
            job_id: jobId,
            process_server_name: processServerName,
            attempt_type: "Successful Serve",
            type_of_serve: successData.serveType,
            person_served_name: successData.personServed,
            address: successData.address,
            mileage: parseMileage(successData.mileage),
            notes: successData.notes || null,
          },
          photoUrl,
        ),
      )
      .select(`${attemptSelectBase}, photo_url`)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await updateJobStatus(jobId, "Completed");

    return mapAttemptRow(row as AttemptRow);
  }

  const failedData = data as FailedAttemptInput;

  const { data: row, error } = await supabase
    .from("attempts")
    .insert(
      withOptionalPhotoUrl(
        {
          job_id: jobId,
          process_server_name: processServerName,
          attempt_type: "Failed Attempt",
          address: failedData.address,
          mileage: parseMileage(failedData.mileage),
          notes: failedData.notes || null,
          created_at: new Date(failedData.dateTime).toISOString(),
        },
        photoUrl,
      ),
    )
    .select(`${attemptSelectBase}, photo_url`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapAttemptRow(row as AttemptRow);
}

export async function updateAttempt(
  attemptId: string,
  input: EditAttemptInput,
): Promise<Attempt> {
  const createdAt = new Date(
    `${input.serviceDate}T${input.serviceTime}`,
  ).toISOString();

  const { data, error } = await supabase
    .from("attempts")
    .update({
      created_at: createdAt,
      edit_notes: input.editNote.trim(),
    })
    .eq("id", attemptId)
    .select(`${attemptSelectBase}, photo_url`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [updatedAttempt] = await attachJobDetails([data as AttemptRow]);
  return updatedAttempt;
}