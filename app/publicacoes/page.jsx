import SiteChrome from "@/components/SiteChrome";
import { PublicacoesDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function PublicacoesPage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <PublicacoesDashboard data={data} compact />
    </SiteChrome>
  );
}
