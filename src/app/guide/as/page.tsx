import { redirect } from "next/navigation";

export default function GuideAsRedirectPage() {
  redirect("/guides?cat=as");
}
