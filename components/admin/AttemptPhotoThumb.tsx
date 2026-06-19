"use client";

type AttemptPhotoThumbProps = {
  photoUrl: string;
  alt: string;
  onClick: () => void;
};

export default function AttemptPhotoThumb({
  photoUrl,
  alt,
  onClick,
}: AttemptPhotoThumbProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-lg border border-gray-200 transition hover:border-blue-400 hover:shadow-sm"
      title="View photo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt={alt}
        className="h-16 w-16 object-cover transition group-hover:scale-105"
      />
    </button>
  );
}