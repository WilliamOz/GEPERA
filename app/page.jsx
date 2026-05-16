import SiteChrome from "@/components/SiteChrome";
import FullPageSections from "@/components/FullPageSections";
import { HomeDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const data = publicData();
  return (
    <SiteChrome data={data}>
      <FullPageSections>
        <HomeDashboard data={data} />
      </FullPageSections>
    </SiteChrome>
  );
}
