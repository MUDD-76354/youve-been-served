type SuccessFormData = {
  serveType: string;
  personServed: string;
  mileage: string;
  notes: string;
};

type FailedFormData = {
  address: string;
  dateTime: string;
  mileage: string;
  notes: string;
};

export const PROCESS_SERVERS_GROUP_NUMBERS = (
  process.env.NEXT_PUBLIC_PROCESS_SERVERS_SMS_NUMBERS ?? ""
)
  .split(",")
  .map((number) => number.trim())
  .filter(Boolean);

function formatDateTime(value: string): string {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function appendField(lines: string[], label: string, value: string) {
  if (value.trim()) {
    lines.push(`${label}: ${value.trim()}`);
  }
}

export function formatSuccessServeMessage(data: SuccessFormData): string {
  const lines = ["SUCCESSFUL SERVE", "Bohn & Associates", ""];

  appendField(lines, "Type of Serve", data.serveType);
  appendField(lines, "Name", data.personServed);
  appendField(lines, "Mileage", data.mileage);
  appendField(lines, "Notes", data.notes);

  return lines.join("\n");
}

export function formatFailedAttemptMessage(data: FailedFormData): string {
  const lines = ["FAILED ATTEMPT", "Bohn & Associates", ""];

  appendField(lines, "Address", data.address);
  appendField(lines, "Date & Time", formatDateTime(data.dateTime));
  appendField(lines, "Mileage", data.mileage);
  appendField(lines, "Notes", data.notes);

  return lines.join("\n");
}

export function buildSmsUrl(recipients: string[], body: string): string {
  const encodedBody = encodeURIComponent(body);

  if (recipients.length > 0) {
    return `sms:${recipients.join(",")}?body=${encodedBody}`;
  }

  return `sms:?body=${encodedBody}`;
}

export function openSmsApp(recipients: string[], body: string) {
  window.location.href = buildSmsUrl(recipients, body);
}