import { notFound } from "next/navigation";
import { GenerationDetailClient } from "@/components/car/GenerationDetailClient";
import { PortalLayout } from "@/components/portal";
import { carBrandHref, carModelHubHref, getCarGeneration, getCarGenerationIds, getHyundaiGrandeurHub } from "@/lib/car-data";

export function generateStaticParams() {
  return getCarGenerationIds("grandeur", "hyundai").map((generationId) => ({ generationId }));
}

export default async function GrandeurGenerationPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;
  const generation = getCarGeneration(generationId);
  const hub = getHyundaiGrandeurHub();

  if (!generation || generation.modelKey !== "grandeur") {
    notFound();
  }

  return (
    <PortalLayout
      defaultQuery={`${generation.displayName} ${generation.defaultBatteryCode}`}
      title={generation.displayName}
      description={`${generation.yearRange} · ${generation.batteryType} · AGM ${generation.agm} · DIN ${generation.din}`}
      breadcrumbs={[
        { label: "홈", href: "/" },
        { label: "차종 검색", href: "/vehicles" },
        { label: "현대", href: carBrandHref("hyundai") },
        { label: hub.displayName, href: carModelHubHref("hyundai", "grandeur") },
        { label: generation.displayName },
      ]}
      sidebar={null}
    >
      <GenerationDetailClient generation={generation} />
    </PortalLayout>
  );
}
