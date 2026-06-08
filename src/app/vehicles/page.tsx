import { Suspense } from "react";
import { PageShell } from "@/components/common/PageShell";
import { VehiclesBrowseClient } from "@/components/platform/VehiclesBrowseClient";

export default function VehiclesPage() {
  return (
    <PageShell zone="vehicle" pageLabel="차종검색" showPageHeader={false} wide>
      <Suspense fallback={null}>
        <VehiclesBrowseClient />
      </Suspense>
    </PageShell>
  );
}
