"use client";

import { useToast } from "@/components/ToastProvider";
import { EditJobInput, JOB_STATUSES, Job, JobStatus } from "@/lib/admin";
import { getErrorMessage } from "@/lib/errors";
import { FormEvent, useState } from "react";

type EditJobFormProps = {
  job: Job;
  onSave: (jobId: string, input: EditJobInput) => Promise<void>;
  onCancel: () => void;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "block text-sm font-medium text-gray-700";

function jobToForm(job: Job): EditJobInput {
  return {
    client: job.client,
    defendantName: job.defendantName,
    address: job.address,
    documentsToServe: job.documentsToServe,
    processServer: job.processServer,
    status: job.status,
  };
}

export default function EditJobForm({ job, onSave, onCancel }: EditJobFormProps) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<EditJobInput>(() => jobToForm(job));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(job.id, form);
      showSuccess(
        `Changes to ${form.defendantName} were saved.`,
        "Job updated",
      );
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to update job in Supabase.",
      );
      setError(message);
      showError(message, "Could not update job");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Job</h2>
            <p className="mt-1 text-sm text-gray-600">
              Update assignment details and job status.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-800"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={`${labelClassName} md:col-span-2`}>
              Client
              <input
                type="text"
                required
                value={form.client}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    client: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="Law firm or hiring client"
              />
            </label>

            <label className={labelClassName}>
              Subject Name
              <input
                type="text"
                required
                value={form.defendantName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    defendantName: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              Assign to
              <input
                type="text"
                required
                value={form.processServer}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    processServer: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="Process server name"
              />
            </label>

            <label className={labelClassName}>
              Status
              <select
                required
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as JobStatus,
                  }))
                }
                className={inputClassName}
              >
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClassName} md:col-span-2`}>
              Address
              <input
                type="text"
                required
                value={form.address}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </label>

            <label className={`${labelClassName} md:col-span-2`}>
              Documents to Serve
              <textarea
                required
                rows={4}
                value={form.documentsToServe}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    documentsToServe: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}