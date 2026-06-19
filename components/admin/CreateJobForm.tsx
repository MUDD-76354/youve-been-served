"use client";

import { useToast } from "@/components/ToastProvider";
import { NewJobInput } from "@/lib/admin";
import { getErrorMessage } from "@/lib/errors";
import { FormEvent, useState } from "react";

type CreateJobFormProps = {
  onCreateJob: (job: NewJobInput) => Promise<void>;
};

const initialForm: NewJobInput = {
  defendantName: "",
  address: "",
  documentsToServe: "",
  processServer: "",
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "block text-sm font-medium text-gray-700";

export default function CreateJobForm({ onCreateJob }: CreateJobFormProps) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { defendantName, processServer } = form;
      await onCreateJob(form);
      setForm(initialForm);
      showSuccess(
        `Job for ${defendantName} was created and assigned to ${processServer}.`,
        "Job created",
      );
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to create job in Supabase.",
      );
      setError(message);
      showError(message, "Could not create job");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create New Job</h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter case details and assign the job to a process server.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            Defendant Name
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
              placeholder="Full defendant name"
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
              placeholder="Service address"
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
              placeholder="List documents to be served"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Create Job"}
        </button>
      </form>
    </section>
  );
}