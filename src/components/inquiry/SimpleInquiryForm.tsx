"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { InquiryChip } from "@/lib/inquiry/inquiry-form-shared";
import { useInquiryUserPrefill } from "@/lib/inquiry/use-inquiry-user-prefill";
import "@/styles/simple-inquiry-form.css";

export type SimpleInquiryFormValues = {
  contact: string;
  message: string;
  name?: string;
  vehicle?: string;
  region?: string;
  title?: string;
  chipId?: string;
  chipLabel?: string;
  isSecret?: boolean;
  userId?: string;
  isMember?: boolean;
};

type Props = {
  formId?: string;
  contactInputId?: string;
  chips?: InquiryChip[];
  defaultChipId?: string;
  productHint?: string;
  submitLabel?: string;
  submitting?: boolean;
  showSecret?: boolean;
  optionalFields?: ("name" | "vehicle" | "region" | "title")[];
  vehiclePlaceholder?: string;
  initialVehicle?: string;
  onSubmit: (values: SimpleInquiryFormValues) => void | Promise<void>;
  submitClassName?: string;
  prefillUser?: boolean;
  /** 상품문의: 문의 내용을 연락처보다 먼저 표시 */
  messageFirst?: boolean;
};

export function SimpleInquiryForm({
  formId,
  contactInputId,
  chips,
  defaultChipId,
  productHint,
  submitLabel = "문의 접수하기",
  submitting = false,
  showSecret = false,
  optionalFields = ["name", "vehicle"],
  vehiclePlaceholder = "예: 쏘렌토 TM",
  initialVehicle,
  onSubmit,
  submitClassName = "simple-inquiry-form__submit bg-gradient-to-r from-[#0F172A] via-[#2563EB] to-[#06B6D4] text-white shadow-md disabled:opacity-60",
  prefillUser = true,
  messageFirst = false,
}: Props) {
  const prefill = useInquiryUserPrefill(prefillUser);
  const prefillDone = useRef(false);
  const [chipId, setChipId] = useState(defaultChipId ?? chips?.[0]?.id ?? "");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState(initialVehicle ?? "");
  const [region, setRegion] = useState("");
  const [title, setTitle] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setVehicle(initialVehicle ?? "");
    if (defaultChipId) setChipId(defaultChipId);
  }, [initialVehicle, defaultChipId]);

  useEffect(() => {
    if (!prefillUser || prefillDone.current) return;
    if (prefill.name) setName(prefill.name);
    if (prefill.contact) setContact(prefill.contact);
    prefillDone.current = true;
  }, [prefillUser, prefill.name, prefill.contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeChip = chips?.find((c) => c.id === chipId);
    await onSubmit({
      contact: contact.trim() || prefill.contact.trim(),
      message: message.trim(),
      name: name.trim() || prefill.name.trim() || undefined,
      vehicle: vehicle.trim() || undefined,
      region: region.trim() || undefined,
      title: title.trim() || undefined,
      chipId: activeChip?.id,
      chipLabel: activeChip?.label,
      isSecret: showSecret ? isSecret : undefined,
      userId: prefill.userId,
      isMember: prefill.isMember,
    });
  };

  const showMoreToggle = optionalFields.length > 0;

  const contactField = (
    <label className="simple-inquiry-form__field">
      연락처
      <input
        id={contactInputId}
        required
        type="tel"
        autoComplete="tel"
        placeholder="010-0000-0000"
        value={contact || prefill.contact}
        onChange={(e) => setContact(e.target.value)}
      />
    </label>
  );

  const messageField = (
    <label className="simple-inquiry-form__field">
      문의 내용
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
    </label>
  );

  return (
    <form id={formId} className="simple-inquiry-form" onSubmit={handleSubmit}>
      {productHint ? <p className="simple-inquiry-form__product-hint">{productHint}</p> : null}

      {chips && chips.length > 0 ? (
        <div className="simple-inquiry-form__chips" role="group" aria-label="문의 유형">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={clsx(
                "simple-inquiry-form__chip",
                chipId === chip.id && "simple-inquiry-form__chip--active",
              )}
              onClick={() => setChipId(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}

      {messageFirst ? (
        <>
          {messageField}
          {contactField}
        </>
      ) : (
        <>
          {contactField}
          {messageField}
        </>
      )}

      {showSecret ? (
        <label className="simple-inquiry-form__secret">
          <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
          <span>비밀글</span>
          <span className="simple-inquiry-form__secret-hint">작성자와 관리자만 확인</span>
        </label>
      ) : null}

      {showMoreToggle ? (
        <button
          type="button"
          className="simple-inquiry-form__more-toggle"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          {moreOpen ? "접기" : "더 입력하기"}
        </button>
      ) : null}

      {moreOpen && showMoreToggle ? (
        <div className="simple-inquiry-form__more-fields">
          {optionalFields.includes("name") ? (
            <label className="simple-inquiry-form__field">
              이름
              <input
                autoComplete="name"
                value={name || prefill.name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          ) : null}
          {optionalFields.includes("vehicle") ? (
            <label className="simple-inquiry-form__field">
              차량명
              <input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder={vehiclePlaceholder}
              />
            </label>
          ) : null}
          {optionalFields.includes("region") ? (
            <label className="simple-inquiry-form__field">
              지역
              <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 부산 사상구" />
            </label>
          ) : null}
          {optionalFields.includes("title") ? (
            <label className="simple-inquiry-form__field">
              제목
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
          ) : null}
        </div>
      ) : null}

      <button type="submit" disabled={submitting} className={submitClassName}>
        {submitting ? "접수 중…" : submitLabel}
      </button>
    </form>
  );
}
