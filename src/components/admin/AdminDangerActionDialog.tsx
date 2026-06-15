"use client";

import { useEffect, useState, type ReactNode } from "react";

export type AdminDangerSummaryRow = {
  label: string;
  value: ReactNode;
};

export type AdminDangerActionConfig = {
  actionKey: string;
  title: string;
  severity: "caution" | "warning" | "danger";
  summaryRows: AdminDangerSummaryRow[];
  warnings: string[];
  confirmLabel: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reversible?: boolean;
};

type Props = {
  open: boolean;
  config: AdminDangerActionConfig | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
};

const SEVERITY_LABEL: Record<AdminDangerActionConfig["severity"], string> = {
  caution: "주의",
  warning: "확인 필요",
  danger: "위험",
};

export function AdminDangerActionDialog({
  open,
  config,
  loading = false,
  error,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open, config?.actionKey]);

  if (!open || !config) return null;

  const reasonRequired = config.requireReason === true;
  const canConfirm = !loading && (!reasonRequired || reason.trim().length > 0);

  return (
    <div className="admin-modal admin-danger-dialog" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" aria-label="닫기" onClick={onClose} />
      <div className="admin-modal__panel admin-danger-dialog__panel">
        <div className="admin-modal__header admin-danger-dialog__header">
          <div>
            <span className={`admin-danger-dialog__badge admin-danger-dialog__badge--${config.severity}`}>
              {SEVERITY_LABEL[config.severity]}
            </span>
            <h3 className="admin-modal__title admin-danger-dialog__title">{config.title}</h3>
          </div>
          <button type="button" className="admin-danger-dialog__close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="admin-modal__body admin-danger-dialog__body">
          {config.summaryRows.length > 0 ? (
            <dl className="admin-danger-dialog__summary">
              {config.summaryRows.map((row) => (
                <div key={row.label} className="admin-danger-dialog__summary-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <ul className="admin-danger-dialog__warnings">
            {config.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>

          {config.reversible === false ? (
            <p className="admin-danger-dialog__note">이 작업은 되돌릴 수 없거나 별도 보정이 필요할 수 있습니다.</p>
          ) : null}

          {reasonRequired ? (
            <label className="admin-danger-dialog__reason">
              <span>{config.reasonLabel ?? "처리 사유"}</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="admin-danger-dialog__reason-input"
                placeholder={config.reasonPlaceholder ?? "사유를 입력해 주세요"}
                disabled={loading}
              />
            </label>
          ) : null}

          {error ? (
            <p className="admin-danger-dialog__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="admin-modal__footer admin-danger-dialog__footer">
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--md" onClick={onClose} disabled={loading}>
            돌아가기
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn--md admin-danger-dialog__confirm admin-danger-dialog__confirm--${config.severity}`}
            disabled={!canConfirm}
            onClick={() => void onConfirm(reason.trim())}
          >
            {loading ? "처리 중…" : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
