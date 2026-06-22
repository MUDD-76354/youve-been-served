import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import JobNotesBlock from "@/components/mobile/JobNotesBlock";
import { statusStyles } from "@/components/mobile/constants";
import { Job } from "@/lib/admin";
import { AttemptType } from "@/lib/attempts";
import { type ReactNode } from "react";

export type SubmitPhase = "idle" | "uploading-photo" | "saving";

type SuccessSummary = {
  serveType: string;
  personServed: string;
  mileage: string;
  notes: string;
};

type FailedSummary = {
  address: string;
  dateTime: string;
  mileage: string;
  notes: string;
};

type AttemptConfirmationProps = {
  job: Job;
  serverName: string;
  attemptType: AttemptType;
  successForm: SuccessSummary;
  failedForm: FailedSummary;
  photoPreviewUrl: string | null;
  submitPhase: SubmitPhase;
  onBack: () => void;
  onConfirm: () => void;
};

function getSubmitMessage(phase: SubmitPhase): string | null {
  if (phase === "uploading-photo") {
    return "Uploading photo...";
  }

  if (phase === "saving") {
    return "Saving attempt...";
  }

  return null;
}

function formatDateTime(value: string): string {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMileage(value: string): string {
  if (!value.trim()) {
    return "—";
  }

  return `${value} mi`;
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {title}
        </h4>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function ReviewField({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  const displayValue = value.trim() ? value : "—";

  return (
    <div className={emphasize ? "py-1" : "py-2.5"}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 leading-relaxed text-gray-900 ${
          emphasize ? "text-xl font-bold" : "text-base font-medium"
        }`}
      >
        {displayValue}
      </p>
    </div>
  );
}

function PhotoAttachmentCard({ photoPreviewUrl }: { photoPreviewUrl: string | null }) {
  const hasPhoto = Boolean(photoPreviewUrl);

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        hasPhoto
          ? "border-green-500 bg-green-50"
          : "border-dashed border-gray-300 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            hasPhoto ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          {hasPhoto ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {hasPhoto ? "Photo attached" : "No photo attached"}
          </p>
          <p className="mt-0.5 text-xs text-gray-600">
            {hasPhoto
              ? "A proof-of-service image will be saved with this attempt."
              : "Optional — you can go back to add one if needed."}
          </p>
        </div>
      </div>

      {photoPreviewUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-green-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreviewUrl}
            alt="Attached attempt photo"
            className="max-h-52 w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

export default function AttemptConfirmation({
  job,
  serverName,
  attemptType,
  successForm,
  failedForm,
  photoPreviewUrl,
  submitPhase,
  onBack,
  onConfirm,
}: AttemptConfirmationProps) {
  const isSuccess = attemptType === "success";
  const isSubmitting = submitPhase !== "idle";
  const submitMessage = getSubmitMessage(submitPhase);
  const notes = isSuccess ? successForm.notes : failedForm.notes;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Final review
        </p>
        <h3 className="mt-1 text-2xl font-bold text-gray-900">Confirm before sending</h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-950/80">
          Check each section below. Confirming will save this attempt and open
          your messaging app.
        </p>
      </section>

      <ReviewSection title="Job">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subject Name
              </p>
              <p className="mt-1 text-2xl font-bold leading-tight text-gray-900">
                {job.defendantName}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[job.status]}`}
            >
              {job.status}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <ReviewField label="Service Address" value={job.address} />
          </div>

          <div className="border-t border-gray-100 pt-2">
            <ReviewField label="Process Server" value={serverName} />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <JobNotesBlock notes={job.notes} />
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title="Attempt">
        <div className="space-y-4">
          <div
            className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
              isSuccess
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-800 text-white"
            }`}
          >
            {isSuccess ? "Successful Serve" : "Failed Attempt"}
          </div>

          {isSuccess ? (
            <ReviewField label="Type of Serve" value={successForm.serveType} />
          ) : (
            <div className="space-y-1 border-t border-gray-100 pt-4">
              <ReviewField label="Attempt Address" value={failedForm.address} />
              <ReviewField
                label="Date & Time"
                value={formatDateTime(failedForm.dateTime)}
              />
            </div>
          )}
        </div>
      </ReviewSection>

      <ReviewSection title="Key Details">
        <div className="space-y-5">
          {isSuccess ? (
            <ReviewField
              label="Person Served"
              value={successForm.personServed}
              emphasize
            />
          ) : null}

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Mileage
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatMileage(isSuccess ? successForm.mileage : failedForm.mileage)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Photo
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {photoPreviewUrl ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Notes
            </p>
            {notes.trim() ? (
              <p className="mt-2 rounded-xl bg-gray-50 px-4 py-3 text-base leading-relaxed text-gray-900">
                {notes}
              </p>
            ) : (
              <p className="mt-2 text-base font-medium text-gray-400">None</p>
            )}
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title="Photo Attachment">
        <PhotoAttachmentCard photoPreviewUrl={photoPreviewUrl} />
      </ReviewSection>

      {isSubmitting && submitMessage ? (
        <div
          className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4"
          aria-live="polite"
        >
          <LoadingSpinner className="h-6 w-6 text-blue-600" label={submitMessage} />
          <div>
            <p className="text-sm font-semibold text-blue-900">{submitMessage}</p>
            <p className="text-xs text-blue-700">Please keep this screen open.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner className="h-5 w-5 text-white" />
              <span>{submitMessage ?? "Working..."}</span>
            </>
          ) : (
            "Confirm & Send"
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          Go Back & Edit
        </button>
      </div>
    </div>
  );
}