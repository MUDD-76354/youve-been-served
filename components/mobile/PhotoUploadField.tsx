"use client";

import { AttemptType } from "@/lib/attempts";
import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type PhotoUploadFieldProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  attemptType?: AttemptType;
};

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function getUploadCopy(attemptType: AttemptType | undefined) {
  if (attemptType === "failed") {
    return {
      title: "Upload Photo (Optional)",
      description:
        "Add a photo of the location, door, or attempt details if helpful.",
    };
  }

  return {
    title: "Add Photo for Proof of Service",
    description:
      "Optional — document the serve with a photo from your camera or gallery.",
  };
}

export default function PhotoUploadField({
  file,
  onChange,
  attemptType,
}: PhotoUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const copy = getUploadCopy(attemptType);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function selectFile(selectedFile: File | null) {
    if (!selectedFile) {
      onChange(null);
      return;
    }

    if (!isImageFile(selectedFile)) {
      return;
    }

    onChange(selectedFile);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  function handleRemove() {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{copy.title}</p>
        <p className="mt-1 text-sm text-gray-600">{copy.description}</p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
      />

      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border-2 border-green-500 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Attempt photo preview"
            className="max-h-72 w-full bg-gray-100 object-contain"
          />
          <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:flex-row">
            <button
              type="button"
              onClick={openFilePicker}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex-1 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Remove Photo
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-labelledby={inputId}
          className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isDragging ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.719-2.22-.377-.063-.754-.12-1.134-.175a2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </div>

          <p className="mt-4 text-base font-semibold text-gray-900">
            {isDragging ? "Drop photo here" : "Tap to add a photo"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Or drag and drop an image file
          </p>
          <span className="mt-4 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
            Choose Photo
          </span>
        </div>
      )}
    </div>
  );
}