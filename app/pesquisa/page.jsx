import SiteChrome from "@/components/SiteChrome";
import Tabs from "@/components/Tabs";
import { PageIntro, Section } from "@/components/Blocks";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function PesquisaPage() {
  const data = publicData();
  const page = data.pages.pesquisa;
  const mapImage = page.images?.find((item) => item.image?.includes("mapa")) || page.images?.[0];
  return (
    <SiteChrome data={data}>
      <PageIntro eyebrow={page.eyebrow} title={page.title} />
      <Section>
        <div className="research-visual-grid">
          {mapImage && (
            <figure className="research-map-only">
              <img src={mapImage.image} alt={mapImage.caption || page.title} />
            </figure>
          )}
          <div className="cards-grid-next one">
            {page.lines.map((line) => <article className="glass-card check-card" key={line.title}><span>✓</span><h3>{line.title}</h3><p>{line.body}</p></article>)}
          </div>
        </div>
      </Section>
      <Section>
        <Tabs items={page.tabs} />
      </Section>
    </SiteChrome>
  );
}
