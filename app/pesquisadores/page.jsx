import SiteChrome from "@/components/SiteChrome";
import { PageIntro, Section } from "@/components/Blocks";
import ResearchersModel from "@/components/ResearchersModel";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function PesquisadoresPage() {
  const data = publicData();
  const page = data.pages.pesquisadores;
  const coordinators = page.researchers.filter((person) => person.role === "Coordenadores do GEPERA");
  const researchers = page.researchers.filter((person) => person.role !== "Coordenadores do GEPERA");

  return (
    <SiteChrome data={data}>
      <PageIntro eyebrow={page.eyebrow} title={page.title} />
      <Section>
        <ResearchersModel coordinators={coordinators} researchers={researchers} logo={data.settings.logo} />
      </Section>
    </SiteChrome>
  );
}
