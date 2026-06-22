import { statusStyles } from "@/components/mobile/constants";
import { Job } from "@/lib/admin";

type SelectedJobCardProps = {
  job: Job;
};

export default function SelectedJobCard({ job }: SelectedJobCardProps) {
  return (
    <section
      aria-label="Selected job details"
      className="sticky top-0 z-10 mb-6 overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-md"
    >
      <div className="bg-blue-600 px-4 py-2.5">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-blue-100">
          Logging attempt for
        </p>
      </div>

      <div className="bg-gradient-to-b from-blue-50 to-white px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Subject Name
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-gray-900">
              {job.defendantName}
            </h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[job.status]}`}
          >
            {job.status}
          </span>
        </div>

        <div className="mt-4 border-t border-blue-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Address
          </p>
          <p className="mt-1.5 text-base font-medium leading-relaxed text-gray-800">
            {job.address}
          </p>
        </div>
      </div>
    </section>
  );
}