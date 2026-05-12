import SiteChrome from "@/components/SiteChrome";
import MediaCarousel from "@/components/MediaCarousel";
import { PageIntro, Section } from "@/components/Blocks";
import { publicData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function SobrePage() {
  const data = publicData();
  const page = data.pages.sobre;
  return (
    <SiteChrome data={data}>
      <PageIntro eyebrow={page.eyebrow} title={page.title} lead="QUEM SOMOS?" />
      <Section>
        <div className="two-col-next">
          <MediaCarousel images={page.carousel} title="GEPERA" />
          <div className="text-column-next">
            {page.paragraphs.map((text) => <p key={text}>{text}</p>)}
          </div>
        </div>
      </Section>
      {page.timeline?.length > 0 && (
        <Section>
          <div className="timeline-next">
            {page.timeline.map((item) => (
              <article className="glass-card" key={item.year + item.title}>
                <strong>{item.year}</strong>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Section>
      )}
    </SiteChrome>
  );
}
