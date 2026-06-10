"use client";

import { useRef, useState } from "react";
import { AdminProductRegisterDrawer } from "@/components/admin/AdminProductRegisterDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminProductImportPreviewRow } from "@/types/admin-product";

export function AdminProductsToolbar() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<AdminProductImportPreviewRow[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    window.location.href = "/api/admin/products/export";
  };

  const handleImportPreview = async (file: File) => {
    setImporting(true);
    setImportError(null);
    setPreview(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/products/import/preview", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setImportError(data.message ?? "업로드 미리보기에 실패했습니다.");
        return;
      }
      setPreview(data.rows as AdminProductImportPreviewRow[]);
    } catch {
      setImportError("파일을 처리하지 못했습니다.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="admin-panel border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-bold text-slate-800">상품 정보 등록·보완</p>
        <p className="mt-1 text-sm font-medium text-slate-600">
          기존 카탈로그 상품의 가격/상태/이미지/상세 정보를 보완합니다. 신규 카탈로그 SKU 생성은
          별도 과제입니다.
        </p>
      </div>
      <div className="admin-toolbar">
        <p className="admin-toolbar__hint">
          CSV로 가격·이미지·상세 누락 목록을보내거나 업로드 미리보기를 할 수 있습니다.
        </p>
        <div className="admin-toolbar__actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--md"
            onClick={() => setRegisterOpen(true)}
          >
            상품 정보 등록·보완
          </button>
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--md" onClick={handleExport}>
            전체 CSV 다운로드
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--md"
            onClick={() => {
              window.location.href = "/api/admin/products/export?filter=price_missing";
            }}
          >
            가격 누락
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--md"
            onClick={() => {
              window.location.href = "/api/admin/products/export?filter=image_missing";
            }}
          >
            이미지 누락
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--md"
            onClick={() => {
              window.location.href = "/api/admin/products/export?filter=detail_missing";
            }}
          >
            상세 누락
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--md"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? "검증 중…" : "CSV 업로드 미리보기"}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleImportPreview(f);
            e.target.value = "";
          }}
        />
      </div>

      {importError ? (
        <p className="text-sm font-bold text-red-600" role="alert">
          {importError}
        </p>
      ) : null}

      {preview && preview.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">업로드 미리보기 (적용 전)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <p className="text-slate-600">
              변경 예정 {preview.filter((r) => r.status === "success").length}건 · 실패{" "}
              {preview.filter((r) => r.status === "failed").length}건 · 변경 없음{" "}
              {preview.filter((r) => r.status === "unchanged").length}건
            </p>
            <p className="font-medium text-amber-800">
              아직 DB/카탈로그에 반영하지 않습니다. 확인 후「적용」기능은 추후 연결됩니다.
            </p>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {preview.slice(0, 20).map((row) => (
                <li key={row.productId} className="rounded border border-slate-100 px-2 py-1">
                  <span className="font-mono">{row.productId}</span> — {row.status}
                  {row.message ? `: ${row.message}` : ""}
                  {row.changes.length > 0 ? (
                    <span className="text-slate-500">
                      {" "}
                      ({row.changes.map((c) => `${c.field}: ${c.before}→${c.after}`).join(", ")})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      <AdminProductRegisterDrawer open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
