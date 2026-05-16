import SiteChrome from "@/components/SiteChrome";
import { AcoesDashboard, PublicacoesDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function AcoesPage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <AcoesDashboard data={data} compact />
      <PublicacoesDashboard data={data} compact />
    </SiteChrome>
  );
}
