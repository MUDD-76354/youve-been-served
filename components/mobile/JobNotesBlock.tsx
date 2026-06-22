type JobNotesBlockProps = {
  notes: string;
  variant?: "compact" | "full";
};

export default function JobNotesBlock({
  notes,
  variant = "full",
}: JobNotesBlockProps) {
  const trimmedNotes = notes.trim();

  if (!trimmedNotes) {
    return null;
  }

  if (variant === "compact") {
    return (
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-amber-950/90">
        <span className="font-semibold text-amber-900">Dispatcher Notes: </span>
        {trimmedNotes}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
        Dispatcher Notes
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-amber-950">
        {trimmedNotes}
      </p>
    </div>
  );
}