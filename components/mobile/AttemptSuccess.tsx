import { Job } from "@/lib/admin";
import { AttemptType } from "@/lib/attempts";

type AttemptSuccessProps = {
  job: Job;
  attemptType: AttemptType;
  onLogAnother: () => void;
  onBackToJobs: () => void;
};

export default function AttemptSuccess({
  job,
  attemptType,
  onLogAnother,
  onBackToJobs,
}: AttemptSuccessProps) {
  const isSuccess = attemptType === "success";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="rounded-2xl border-2 border-green-500 bg-green-50 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-9 w-9"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Attempt logged successfully
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Your attempt for <strong>{job.defendantName}</strong> was saved.
          {isSuccess
            ? " This job has been marked Completed and removed from your active job list."
            : null}{" "}
          Your messaging app should have opened to send the notification SMS.
        </p>
        <p className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-800 ring-1 ring-green-200">
          {isSuccess ? "Successful Serve" : "Failed Attempt"}
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          What&apos;s next?
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>Complete the SMS in your messaging app if it opened.</li>
          <li>Log another attempt for this job, or return to your job list.</li>
        </ul>
      </section>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onLogAnother}
          className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Log Another Attempt
        </button>
        <button
          type="button"
          onClick={onBackToJobs}
          className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Back to All Jobs
        </button>
      </div>
    </div>
  );
}