import SiteChrome from "@/components/SiteChrome";
import { PesquisaDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function PesquisaPage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <PesquisaDashboard data={data} compact />
    </SiteChrome>
  );
}
