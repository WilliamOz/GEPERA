import SiteChrome from "@/components/SiteChrome";
import { SobreDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function SobrePage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <SobreDashboard data={data} compact />
    </SiteChrome>
  );
}
