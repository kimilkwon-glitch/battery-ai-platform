"use client";

import { useEffect, useState } from "react";

type MemberShape = {
  id?: string;
  name?: string;
  phone?: string;
};

export function useInquiryUserPrefill(enabled = true) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [userId, setUserId] = useState<string | undefined>();
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { member?: MemberShape | null }) => {
        const member = data?.member;
        if (!member?.phone && !member?.name) return;
        if (member.name) setName(member.name);
        if (member.phone) setContact(member.phone);
        if (member.id) {
          setUserId(member.id);
          setIsMember(true);
        }
      })
      .catch(() => undefined);
  }, [enabled]);

  return { name, setName, contact, setContact, userId, isMember };
}
