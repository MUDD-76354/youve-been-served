"use client";

import { mobileInputClassName } from "@/components/mobile/constants";
import { useState } from "react";

type ServerIdentityProps = {
  value: string;
  suggestions: string[];
  compact?: boolean;
  readOnly?: boolean;
  onChange: (name: string) => void;
};

export default function ServerIdentity({
  value,
  suggestions,
  compact = false,
  readOnly = false,
  onChange,
}: ServerIdentityProps) {
  const [isEditing, setIsEditing] = useState(!value.trim() && !readOnly);
  const listId = "process-server-suggestions";

  if (readOnly && value.trim()) {
    return (
      <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Process Server
        </p>
        <p className="truncate text-base font-semibold text-gray-900">{value}</p>
      </div>
    );
  }

  if (compact && !isEditing && value.trim()) {
    return (
      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Process Server
          </p>
          <p className="truncate text-base font-semibold text-gray-900">{value}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label className="block text-sm font-semibold text-gray-800">
        Process server name
        <input
          type="text"
          list={listId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (compact && value.trim()) {
              setIsEditing(false);
            }
          }}
          className={mobileInputClassName}
          placeholder="e.g. Mike Johnson"
          autoComplete="name"
        />
      </label>

      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {compact && value.trim() ? (
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="mt-3 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          Done
        </button>
      ) : null}
    </section>
  );
}