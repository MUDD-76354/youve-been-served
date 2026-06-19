"use client";

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { emptyStatePresets, EmptyStateFromPreset } from "@/components/EmptyState";
import { useToast } from "@/components/ToastProvider";
import AttemptPhotoThumb from "@/components/admin/AttemptPhotoThumb";
import PhotoViewerModal from "@/components/admin/PhotoViewerModal";
import { JobStatus, jobStatusStyles } from "@/lib/admin";
import { Attempt } from "@/lib/attempts";
import { getErrorMessage } from "@/lib/errors";
import { downloadPhoto, getPhotoFilename } from "@/lib/photos";
import { filterAttemptsBySearch, normalizeSearchQuery } from "@/lib/search";
import { useMemo, useState } from "react";

type AttemptsTableProps = {
  attempts: Attempt[];
};

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AttemptsTable({ attempts }: AttemptsTableProps) {
  const { showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAttempts = useMemo(
    () => filterAttemptsBySearch(attempts, searchQuery),
    [attempts, searchQuery],
  );
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    title: string;
    subtitle: string;
    filename: string;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function openPhoto(attempt: Attempt) {
    if (!attempt.photoUrl) {
      return;
    }

    setSelectedPhoto({
      url: attempt.photoUrl,
      title: `${attempt.defendantName} — Attempt Photo`,
      subtitle: `${attempt.attemptType} · ${formatCreatedAt(attempt.createdAt)}`,
      filename: getPhotoFilename(attempt.defendantName, attempt.createdAt),
    });
  }

  const showEmptyState = attempts.length === 0 || filteredAttempts.length === 0;
  const attemptsEmptyPreset =
    attempts.length === 0
      ? emptyStatePresets.adminNoAttempts
      : emptyStatePresets.adminNoAttemptsSearch;

  async function handleDownload(attempt: Attempt) {
    if (!attempt.photoUrl) {
      return;
    }

    setDownloadingId(attempt.id);

    try {
      await downloadPhoto(
        attempt.photoUrl,
        getPhotoFilename(attempt.defendantName, attempt.createdAt),
      );
    } catch (err) {
      showError(
        getErrorMessage(err, "Failed to download photo."),
        "Download failed",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Attempts</h2>
        <p className="mt-1 text-sm text-gray-600">
          {normalizeSearchQuery(searchQuery)
            ? `${filteredAttempts.length} of ${attempts.length} attempt${attempts.length === 1 ? "" : "s"} shown`
            : `${attempts.length} logged attempt${attempts.length === 1 ? "" : "s"} from the database`}
          . Click a photo to view full size or download.
        </p>
      </div>

      <AdminSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={filteredAttempts.length}
        totalCount={attempts.length}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {showEmptyState ? (
          <div className="p-6">
            <EmptyStateFromPreset
              preset={attemptsEmptyPreset}
              className="border-0 bg-transparent"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Job</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Server</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Attempt Details
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-600">
                      {formatCreatedAt(attempt.createdAt)}
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p className="font-medium text-gray-900">
                        {attempt.defendantName}
                      </p>
                      {attempt.jobAddress ? (
                        <p className="mt-1 text-xs text-gray-600">
                          {attempt.jobAddress}
                        </p>
                      ) : null}
                      {attempt.jobDocuments ? (
                        <p className="mt-1 text-xs text-gray-600">
                          Docs: {attempt.jobDocuments}
                        </p>
                      ) : null}
                      {attempt.jobStatus ? (
                        <span
                          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            jobStatusStyles[attempt.jobStatus as JobStatus] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {attempt.jobStatus}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {attempt.processServerName || "—"}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{attempt.attemptType}</td>
                    <td className="max-w-xs px-4 py-4 text-gray-600">
                      {attempt.personServedName ? (
                        <p>Served: {attempt.personServedName}</p>
                      ) : null}
                      {attempt.typeOfServe ? <p>{attempt.typeOfServe}</p> : null}
                      {attempt.address ? <p>{attempt.address}</p> : null}
                      {attempt.mileage !== null ? <p>Mileage: {attempt.mileage}</p> : null}
                      {attempt.notes ? <p>{attempt.notes}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      {attempt.photoUrl ? (
                        <div className="flex flex-col items-start gap-2">
                          <AttemptPhotoThumb
                            photoUrl={attempt.photoUrl}
                            alt={`Attempt photo for ${attempt.defendantName}`}
                            onClick={() => openPhoto(attempt)}
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => openPhoto(attempt)}
                              className="text-left text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDownload(attempt)}
                              disabled={downloadingId === attempt.id}
                              className="text-left text-xs font-semibold text-blue-600 transition hover:text-blue-800 disabled:opacity-60"
                            >
                              {downloadingId === attempt.id
                                ? "Downloading..."
                                : "Download"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </section>
  );
}