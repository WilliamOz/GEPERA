import SiteChrome from "@/components/SiteChrome";
import { PesquisadoresDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function PesquisadoresPage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <PesquisadoresDashboard data={data} compact />
    </SiteChrome>
  );
}
