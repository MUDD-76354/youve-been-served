import {
  Attempt,
  AttemptFilters,
  getAttemptDisplayAddress,
} from "@/lib/attempts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportRow = {
  date: string;
  defendant: string;
  server: string;
  outcome: string;
  attemptType: string;
  personServed: string;
  address: string;
  documentsToServe: string;
};

function formatReportDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function attemptToReportRow(
  attempt: Attempt,
  attempts: Attempt[],
): ReportRow {
  return {
    date: formatReportDate(attempt.createdAt),
    defendant: attempt.defendantName,
    server: attempt.processServerName,
    outcome: attempt.attemptType,
    attemptType: attempt.typeOfServe ?? "",
    personServed: attempt.personServedName ?? "",
    address: getAttemptDisplayAddress(attempt, attempts),
    documentsToServe: attempt.jobDocuments ?? "",
  };
}

const reportHeaders = [
  "Date",
  "Subject Name",
  "Server",
  "Outcome",
  "Attempt Type",
  "Person Served",
  "Address",
  "Documents to Serve",
] as const;

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function reportFilename(extension: "csv" | "pdf"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `attempts-report-${date}.${extension}`;
}

export function exportAttemptsToCsv(attempts: Attempt[]): void {
  const rows = attempts.map((attempt) => attemptToReportRow(attempt, attempts));
  const lines = [
    reportHeaders.join(","),
    ...rows.map((row) =>
      [
        row.date,
        row.defendant,
        row.server,
        row.outcome,
        row.attemptType,
        row.personServed,
        row.address,
        row.documentsToServe,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = reportFilename("csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatFilterSummary(filters: AttemptFilters): string[] {
  const parts: string[] = [];

  if (filters.startDate || filters.endDate) {
    parts.push(
      `Date: ${filters.startDate ?? "any"} to ${filters.endDate ?? "any"}`,
    );
  }

  if (filters.processServerName) {
    parts.push(`Server: ${filters.processServerName}`);
  }

  if (filters.client) {
    parts.push(`Client: ${filters.client}`);
  }

  if (filters.outcome) {
    parts.push(`Outcome: ${filters.outcome}`);
  }

  if (filters.typeOfServe) {
    parts.push(`Attempt Type: ${filters.typeOfServe}`);
  }

  return parts.length > 0 ? parts : ["All attempts"];
}

export function exportAttemptsToPdf(
  attempts: Attempt[],
  filters: AttemptFilters,
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const rows = attempts.map((attempt) => attemptToReportRow(attempt, attempts));

  doc.setFontSize(16);
  doc.text("Bohn & Associates — Attempts Report", 40, 36);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Generated ${formatReportDate(new Date().toISOString())}`, 40, 54);
  doc.text(formatFilterSummary(filters).join("  ·  "), 40, 68);
  doc.text(`${attempts.length} result${attempts.length === 1 ? "" : "s"}`, 40, 82);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 96,
    head: [reportHeaders as unknown as string[]],
    body: rows.map((row) => [
      row.date,
      row.defendant,
      row.server,
      row.outcome,
      row.attemptType,
      row.personServed,
      row.address,
      row.documentsToServe,
    ]),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [31, 41, 55] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 40, right: 40 },
  });

  doc.save(reportFilename("pdf"));
}