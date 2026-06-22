"use client";

export const ADMIN_SEARCH_PLACEHOLDER =
  "Search by client, subject name, address, or process server...";

type AdminSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
};

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = ADMIN_SEARCH_PLACEHOLDER,
  resultCount,
  totalCount,
}: AdminSearchBarProps) {
  const showCount =
    value.trim().length > 0 &&
    resultCount !== undefined &&
    totalCount !== undefined;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <label htmlFor="admin-search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          id="admin-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : null}
      </div>
      {showCount ? (
        <p className="mt-2 text-xs text-gray-600">
          Showing {resultCount} of {totalCount} result
          {totalCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}