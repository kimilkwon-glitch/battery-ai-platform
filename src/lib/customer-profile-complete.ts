import type { CustomerProfile } from "@/lib/customer-profile-storage";

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isProfileAddressComplete(profile: CustomerProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.postalCode?.trim() &&
      profile.address1?.trim() &&
      profile.address2?.trim(),
  );
}

export function isProfilePhoneComplete(profile: CustomerProfile | null): boolean {
  if (!profile) return false;
  return phoneDigits(profile.phone).length >= 10;
}

/** 주문/결제에 필요한 최소 회원정보 */
export function isProfileCompleteForCheckout(profile: CustomerProfile | null): boolean {
  if (!profile) return false;
  return Boolean(profile.name?.trim() && isProfilePhoneComplete(profile) && isProfileAddressComplete(profile));
}
