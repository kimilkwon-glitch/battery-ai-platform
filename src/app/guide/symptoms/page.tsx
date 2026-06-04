import { redirect } from "next/navigation";

export default function GuideSymptomsRedirectPage() {
  redirect("/guides?cat=symptoms");
}
