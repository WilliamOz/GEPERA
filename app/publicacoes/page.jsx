import SiteChrome from "@/components/SiteChrome";
import PublicationGrid from "@/components/PublicationGrid";
import { PageIntro, Section } from "@/components/Blocks";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function PublicacoesPage() {
  const data = publicData();
  const page = data.pages.publicacoes || {};
  return (
    <SiteChrome data={data}>
      <PageIntro eyebrow={page.eyebrow} title={page.title || "Publicações"} lead={page.lead} />
      <Section title={page.lead}>
        <PublicationGrid publications={data.pages.acoes.publications} />
      </Section>
    </SiteChrome>
  );
}
