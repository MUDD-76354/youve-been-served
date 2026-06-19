"use client";

import AttemptPhotoThumb from "@/components/admin/AttemptPhotoThumb";
import PhotoViewerModal from "@/components/admin/PhotoViewerModal";
import { emptyStatePresets, EmptyStateFromPreset } from "@/components/EmptyState";
import { Job, jobStatusStyles } from "@/lib/admin";
import { Attempt } from "@/lib/attempts";
import { getPhotoFilename } from "@/lib/photos";
import { useMemo, useState } from "react";

type JobDetailsModalProps = {
  job: Job;
  attempts: Attempt[];
  onClose: () => void;
};

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function JobDetailsModal({
  job,
  attempts,
  onClose,
}: JobDetailsModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    title: string;
    subtitle: string;
    filename: string;
  } | null>(null);

  const jobAttempts = useMemo(
    () =>
      attempts
        .filter((attempt) => attempt.jobId === job.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [attempts, job.id],
  );

  const attemptsWithPhotos = jobAttempts.filter((attempt) => attempt.photoUrl);

  function openPhoto(attempt: Attempt) {
    if (!attempt.photoUrl) {
      return;
    }

    setSelectedPhoto({
      url: attempt.photoUrl,
      title: `${job.defendantName} — Attempt Photo`,
      subtitle: `${attempt.attemptType} · ${formatCreatedAt(attempt.createdAt)}`,
      filename: getPhotoFilename(job.defendantName, attempt.createdAt),
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.defendantName}</h2>
              <p className="mt-1 text-sm text-gray-600">Job details and attempt history</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div className="space-y-6 px-6 py-5">
            <section className="rounded-xl bg-gray-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Address
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{job.address}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Assigned To
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{job.processServer}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Documents
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{job.documentsToServe}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${jobStatusStyles[job.status]}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900">Attached Photos</h3>
              <p className="mt-1 text-sm text-gray-600">
                {attemptsWithPhotos.length} photo
                {attemptsWithPhotos.length === 1 ? "" : "s"} from attempts on this job.
              </p>

              {attemptsWithPhotos.length === 0 ? (
                <div className="mt-4">
                  <EmptyStateFromPreset
                    preset={emptyStatePresets.modalNoPhotos}
                    size="compact"
                  />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {attemptsWithPhotos.map((attempt) => (
                    <button
                      key={attempt.id}
                      type="button"
                      onClick={() => openPhoto(attempt)}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attempt.photoUrl!}
                        alt={`Attempt photo for ${job.defendantName}`}
                        className="h-36 w-full object-cover"
                      />
                      <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-gray-900">
                          {attempt.attemptType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCreatedAt(attempt.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900">All Attempts</h3>
              {jobAttempts.length === 0 ? (
                <div className="mt-4">
                  <EmptyStateFromPreset
                    preset={emptyStatePresets.modalNoAttempts}
                    size="compact"
                  />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {jobAttempts.map((attempt) => (
                    <li
                      key={attempt.id}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">
                            {attempt.attemptType}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {formatCreatedAt(attempt.createdAt)} ·{" "}
                            {attempt.processServerName}
                          </p>
                          {attempt.personServedName ? (
                            <p className="mt-2 text-sm text-gray-700">
                              Served: {attempt.personServedName}
                            </p>
                          ) : null}
                          {attempt.notes ? (
                            <p className="mt-1 text-sm text-gray-700">{attempt.notes}</p>
                          ) : null}
                        </div>
                        {attempt.photoUrl ? (
                          <AttemptPhotoThumb
                            photoUrl={attempt.photoUrl}
                            alt={`Photo for ${attempt.attemptType}`}
                            onClick={() => openPhoto(attempt)}
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      {selectedPhoto ? (
        <PhotoViewerModal
          photoUrl={selectedPhoto.url}
          title={selectedPhoto.title}
          subtitle={selectedPhoto.subtitle}
          downloadFilename={selectedPhoto.filename}
          onClose={() => setSelectedPhoto(null)}
        />
      ) : null}
    </>
  );
}