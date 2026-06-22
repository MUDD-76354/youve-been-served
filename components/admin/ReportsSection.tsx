"use client";

import AdminSearchBar from "@/components/admin/AdminSearchBar";
import {
  emptyStatePresets,
  EmptyStateFromPreset,
  type EmptyStatePreset,
} from "@/components/EmptyState";
import { useToast } from "@/components/ToastProvider";
import {
  ATTEMPT_OUTCOMES,
  Attempt,
  AttemptFilters,
  fetchFilteredAttempts,
  fetchProcessServerNames,
  SERVE_TYPES,
} from "@/lib/attempts";
import { getErrorMessage } from "@/lib/errors";
import { fetchClientNameSuggestions } from "@/lib/jobs";
import { exportAttemptsToCsv, exportAttemptsToPdf } from "@/lib/reports";
import { filterAttemptsBySearch, normalizeSearchQuery } from "@/lib/search";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const emptyFilters: AttemptFilters = {
  startDate: "",
  endDate: "",
  processServerName: "",
  client: "",
  outcome: "",
  typeOfServe: "",
};

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toQueryFilters(filters: AttemptFilters): AttemptFilters {
  return {
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    processServerName: filters.processServerName || undefined,
    client: filters.client || undefined,
    outcome: filters.outcome || undefined,
    typeOfServe: filters.typeOfServe || undefined,
  };
}

export default function ReportsSection() {
  const { showError, showSuccess } = useToast();
  const [filters, setFilters] = useState<AttemptFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<AttemptFilters>({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [serverNames, setServerNames] = useState<string[]>([]);
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttempts = useMemo(
    () => filterAttemptsBySearch(attempts, searchQuery),
    [attempts, searchQuery],
  );

  const loadReport = useCallback(async (nextFilters: AttemptFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFilteredAttempts(nextFilters);
      setAttempts(data);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to load report data.");
      setError(message);
      showError(message, "Could not load report");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  function handleExportCsv() {
    try {
      exportAttemptsToCsv(filteredAttempts);
      showSuccess("Your CSV report download has started.", "Report exported");
    } catch (err) {
      showError(
        getErrorMessage(err, "Failed to export CSV."),
        "Export failed",
      );
    }
  }

  function handleExportPdf() {
    try {
      exportAttemptsToPdf(filteredAttempts, appliedFilters);
      showSuccess("Your PDF report download has started.", "Report exported");
    } catch (err) {
      showError(
        getErrorMessage(err, "Failed to export PDF."),
        "Export failed",
      );
    }
  }

  useEffect(() => {
    void loadReport({});
    void fetchProcessServerNames()
      .then(setServerNames)
      .catch(() => setServerNames([]));
    void fetchClientNameSuggestions()
      .then(setClientNames)
      .catch(() => setClientNames([]));
  }, [loadReport]);

  function handleFilterChange(
    field: keyof AttemptFilters,
    value: string,
  ) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilters = toQueryFilters(filters);
    setAppliedFilters(nextFilters);
    void loadReport(nextFilters);
  }

  function handleClearFilters() {
    setFilters(emptyFilters);
    setAppliedFilters({});
    setSearchQuery("");
    void loadReport({});
  }

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);
  const hasSearch = Boolean(normalizeSearchQuery(searchQuery));
  const showEmptyState =
    !loading && (attempts.length === 0 || filteredAttempts.length === 0);

  function getReportsEmptyPreset(): EmptyStatePreset {
    if (attempts.length === 0) {
      return hasActiveFilters
        ? emptyStatePresets.adminNoAttemptsFilter
        : emptyStatePresets.adminNoAttempts;
    }

    if (hasSearch && hasActiveFilters) {
      return emptyStatePresets.adminNoAttemptsFilterAndSearch;
    }

    return emptyStatePresets.adminNoAttemptsSearch;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <p className="mt-1 text-sm text-gray-600">
          Filter attempts and export the current results to CSV or PDF.
        </p>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Start Date</span>
            <input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(event) =>
                handleFilterChange("startDate", event.target.value)
              }
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">End Date</span>
            <input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(event) =>
                handleFilterChange("endDate", event.target.value)
              }
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Server</span>
            <select
              value={filters.processServerName ?? ""}
              onChange={(event) =>
                handleFilterChange("processServerName", event.target.value)
              }
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All servers</option>
              {serverNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Client</span>
            <input
              type="text"
              list="reports-client-suggestions"
              value={filters.client ?? ""}
              onChange={(event) =>
                handleFilterChange("client", event.target.value)
              }
              placeholder="All clients"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <datalist id="reports-client-suggestions">
              {clientNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Outcome</span>
            <select
              value={filters.outcome ?? ""}
              onChange={(event) =>
                handleFilterChange("outcome", event.target.value)
              }
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All outcomes</option>
              {ATTEMPT_OUTCOMES.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-gray-700">Attempt Type</span>
            <select
              value={filters.typeOfServe ?? ""}
              onChange={(event) =>
                handleFilterChange("typeOfServe", event.target.value)
              }
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All types</option>
              {SERVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </form>

      <AdminSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={filteredAttempts.length}
        totalCount={attempts.length}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {loading
            ? "Loading results..."
            : hasSearch
              ? `${filteredAttempts.length} of ${attempts.length} attempt${attempts.length === 1 ? "" : "s"} shown${hasActiveFilters ? " (filtered)" : ""}`
              : `${attempts.length} attempt${attempts.length === 1 ? "" : "s"}${hasActiveFilters ? " matching filters" : ""}`}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={loading || filteredAttempts.length === 0}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={loading || filteredAttempts.length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export PDF
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading report...
          </div>
        ) : showEmptyState ? (
          <div className="p-6">
            <EmptyStateFromPreset
              preset={getReportsEmptyPreset()}
              className="border-0 bg-transparent"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Subject Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Server</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Outcome</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Attempt Type
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Details</th>
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
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {attempt.processServerName || "—"}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {attempt.attemptType}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {attempt.typeOfServe || "—"}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-gray-600">
                      {attempt.personServedName ? (
                        <p>Served: {attempt.personServedName}</p>
                      ) : null}
                      {attempt.address ? <p>{attempt.address}</p> : null}
                      {attempt.mileage !== null ? (
                        <p>Mileage: {attempt.mileage}</p>
                      ) : null}
                      {attempt.notes ? <p>{attempt.notes}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      {attempt.photoUrl ? (
                        <a
                          href={attempt.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                        >
                          View
                        </a>
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
    </section>
  );
}