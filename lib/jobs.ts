import { EditJobInput, Job, JobStatus, NewJobInput } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

type JobRow = {
  id: string;
  defendant_name: string;
  address: string;
  documents: string;
  assigned_to: string | null;
  status: JobStatus;
  created_at: string;
};

function mapJobRowToJob(row: JobRow): Job {
  return {
    id: row.id,
    defendantName: row.defendant_name,
    address: row.address,
    documentsToServe: row.documents,
    processServer: row.assigned_to ?? "",
    status: row.status,
    createdAt: row.created_at,
    attemptsToday: 0,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, defendant_name, address, documents, assigned_to, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as JobRow[]).map(mapJobRowToJob);
}

export async function createJob(input: NewJobInput): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      defendant_name: input.defendantName,
      address: input.address,
      documents: input.documentsToServe,
      assigned_to: input.processServer,
      status: "Assigned",
    })
    .select(
      "id, defendant_name, address, documents, assigned_to, status, created_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapJobRowToJob(data as JobRow);
}

export async function updateJob(
  jobId: string,
  input: EditJobInput,
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update({
      defendant_name: input.defendantName,
      address: input.address,
      documents: input.documentsToServe,
      assigned_to: input.processServer,
      status: input.status,
    })
    .eq("id", jobId)
    .select(
      "id, defendant_name, address, documents, assigned_to, status, created_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapJobRowToJob(data as JobRow);
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId)
    .select(
      "id, defendant_name, address, documents, assigned_to, status, created_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapJobRowToJob(data as JobRow);
}