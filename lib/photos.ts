export function getPhotoFilename(label: string, createdAt: string): string {
  const date = new Date(createdAt).toISOString().slice(0, 10);
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `attempt-${slug || "photo"}-${date}.jpg`;
}

export async function downloadPhoto(url: string, filename: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to download photo.");
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}