import SiteChrome from "@/components/SiteChrome";
import { CustomContentDashboard } from "@/components/DashboardSections";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function CustomPage({ params }) {
  const data = publicData();
  const { slug } = await params;
  const page = (data.customPages || []).find((item) => item.slug === slug) || {
    eyebrow: "Página",
    title: "Página não encontrada",
    intro: "Esta página personalizada ainda não foi criada no painel.",
    sections: []
  };

  return (
    <SiteChrome data={data}>
      <CustomContentDashboard data={data} page={page} />
    </SiteChrome>
  );
}
