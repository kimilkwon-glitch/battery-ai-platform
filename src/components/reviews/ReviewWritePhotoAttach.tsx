"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import clsx from "clsx";
import {
  REVIEW_IMAGE_ACCEPT,
  REVIEW_IMAGE_MAX_COUNT,
  REVIEW_IMAGE_MIME_TYPES,
} from "@/lib/reviews/review-image-policy";
import { uploadReviewImage } from "@/lib/reviews/review-image-client";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  orderId?: string;
  orderNumber?: string;
  contact?: string;
};

export function ReviewWritePhotoAttach({
  images,
  onChange,
  disabled,
  orderId,
  orderNumber,
  contact,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = REVIEW_IMAGE_MAX_COUNT - images.length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length || disabled) return;
    setError(null);

    const files = Array.from(fileList);
    if (files.length + images.length > REVIEW_IMAGE_MAX_COUNT) {
      setError(`사진은 최대 ${REVIEW_IMAGE_MAX_COUNT}장까지 등록할 수 있습니다.`);
      return;
    }

    setUploading(true);
    const next = [...images];
    try {
      for (const file of files) {
        if (next.length >= REVIEW_IMAGE_MAX_COUNT) break;
        if (!REVIEW_IMAGE_MIME_TYPES.includes(file.type as (typeof REVIEW_IMAGE_MIME_TYPES)[number])) {
          setError("JPG, PNG, WEBP 파일만 등록할 수 있습니다.");
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError("파일 용량은 10MB 이하여야 합니다.");
          continue;
        }
        const url = await uploadReviewImage(file, { orderId, orderNumber, contact });
        next.push(url);
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="review-write-photos">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-black text-slate-900">사진 첨부</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            최대 {REVIEW_IMAGE_MAX_COUNT}장까지 등록할 수 있습니다.
          </p>
        </div>
        {remaining > 0 ? (
          <button
            type="button"
            className="review-write-photos__add"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4 shrink-0" aria-hidden />
            {uploading ? "업로드 중…" : "사진 추가"}
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={REVIEW_IMAGE_ACCEPT}
        multiple
        className="sr-only"
        disabled={disabled || uploading || remaining <= 0}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {images.length > 0 ? (
        <ul className="review-write-photos__grid" aria-label="첨부 사진 미리보기">
          {images.map((src, index) => (
            <li key={`${src.slice(0, 48)}-${index}`} className="review-write-photos__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`첨부 사진 ${index + 1}`} className="review-write-photos__thumb" />
              <button
                type="button"
                className="review-write-photos__remove"
                aria-label={`첨부 사진 ${index + 1} 삭제`}
                disabled={disabled || uploading}
                onClick={() => removeAt(index)}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          className={clsx("review-write-photos__drop", uploading && "review-write-photos__drop--busy")}
          disabled={disabled || uploading || remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-6 text-slate-400" aria-hidden />
          <span className="text-sm font-semibold text-slate-600">
            {uploading ? "업로드 중…" : "탭하여 사진 추가 (선택)"}
          </span>
        </button>
      )}

      {error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
