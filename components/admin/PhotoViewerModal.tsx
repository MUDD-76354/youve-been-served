"use client";

import { useToast } from "@/components/ToastProvider";
import { getErrorMessage } from "@/lib/errors";
import { downloadPhoto } from "@/lib/photos";
import { useState } from "react";

type PhotoViewerModalProps = {
  photoUrl: string;
  title: string;
  subtitle?: string;
  downloadFilename: string;
  onClose: () => void;
};

export default function PhotoViewerModal({
  photoUrl,
  title,
  subtitle,
  downloadFilename,
  onClose,
}: PhotoViewerModalProps) {
  const { showError } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);

    try {
      await downloadPhoto(photoUrl, downloadFilename);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to download photo.");
      setError(message);
      showError(message, "Download failed");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-3">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle ? (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-8rem)] overflow-auto bg-gray-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={title}
            className="mx-auto max-h-[65vh] w-full cursor-zoom-in object-contain"
            onClick={() => window.open(photoUrl, "_blank", "noopener,noreferrer")}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Click the image to open full size in a new tab.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View Full Size
            </a>
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={isDownloading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isDownloading ? "Downloading..." : "Download Photo"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}