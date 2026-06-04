import { redirect } from "next/navigation";

export default function GuideFaultRedirectPage() {
  redirect("/guides?cat=fault");
}
