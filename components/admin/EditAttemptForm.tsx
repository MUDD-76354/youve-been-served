"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Attempt,
  EditAttemptInput,
  toServiceDateInputValue,
  toServiceTimeInputValue,
} from "@/lib/attempts";
import { getErrorMessage } from "@/lib/errors";
import { FormEvent, useState } from "react";

type EditAttemptFormProps = {
  attempt: Attempt;
  subjectName: string;
  onSave: (attemptId: string, input: EditAttemptInput) => Promise<void>;
  onCancel: () => void;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "block text-sm font-medium text-gray-700";

function attemptToForm(attempt: Attempt): EditAttemptInput {
  return {
    serviceDate: toServiceDateInputValue(attempt.createdAt),
    serviceTime: toServiceTimeInputValue(attempt.createdAt),
    editNote: "",
  };
}

export default function EditAttemptForm({
  attempt,
  subjectName,
  onSave,
  onCancel,
}: EditAttemptFormProps) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<EditAttemptInput>(() => attemptToForm(attempt));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(attempt.id, form);
      showSuccess(
        `Service date and time for ${subjectName} were updated.`,
        "Attempt updated",
      );
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to update attempt in Supabase.",
      );
      setError(message);
      showError(message, "Could not update attempt");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Attempt</h2>
            <p className="mt-1 text-sm text-gray-600">
              Correct the service date and time for {subjectName}.
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
          <label className={labelClassName}>
            Service Date
            <input
              type="date"
              required
              value={form.serviceDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  serviceDate: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Service Time
            <input
              type="time"
              required
              value={form.serviceTime}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  serviceTime: event.target.value,
                }))
              }
              className={inputClassName}
            />
          </label>

          <label className={labelClassName}>
            Edit Note
            <textarea
              required
              rows={4}
              value={form.editNote}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  editNote: event.target.value,
                }))
              }
              className={inputClassName}
              placeholder="Explain why this correction is being made"
            />
          </label>

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