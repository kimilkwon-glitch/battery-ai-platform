const MAX_EDGE = 1200;
const JPEG_QUALITY = 0.82;

export async function compressReviewImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "review";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export type ReviewUploadContext = {
  orderId?: string;
  orderNumber?: string;
  contact?: string;
};

export async function uploadReviewImage(
  file: File,
  context: ReviewUploadContext = {},
): Promise<string> {
  const compressed = await compressReviewImageFile(file);
  const form = new FormData();
  form.append("file", compressed);
  if (context.orderId) form.append("orderId", context.orderId);
  if (context.orderNumber) form.append("orderNumber", context.orderNumber);
  if (context.contact) form.append("contact", context.contact);

  const res = await fetch("/api/reviews/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = (await res.json()) as {
    ok?: boolean;
    url?: string;
    dataUrl?: string;
    message?: string;
  };

  if (!res.ok || !data.ok) {
    throw new Error(data.message ?? "사진 업로드에 실패했습니다.");
  }
  if (data.url) return data.url;
  if (data.dataUrl) return data.dataUrl;
  throw new Error("사진 업로드 응답이 올바르지 않습니다.");
}
