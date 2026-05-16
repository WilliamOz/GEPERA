import SiteChrome from "@/components/SiteChrome";
import { ObjetivosDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function ObjetivosPage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <ObjetivosDashboard data={data} compact />
    </SiteChrome>
  );
}
