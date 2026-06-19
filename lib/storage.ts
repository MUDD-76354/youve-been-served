import { supabase } from "@/lib/supabase";

export const ATTEMPT_PHOTOS_BUCKET = "attempt-photos";

function getFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  const fromType = file.type.split("/").pop()?.toLowerCase();
  if (fromType && fromType !== "jpeg") {
    return fromType === "jpg" ? "jpg" : fromType;
  }

  return "jpg";
}

export async function uploadAttemptPhoto(
  file: File,
  jobId: string,
): Promise<string> {
  const extension = getFileExtension(file);
  const filePath = `${jobId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(ATTEMPT_PHOTOS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(ATTEMPT_PHOTOS_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}