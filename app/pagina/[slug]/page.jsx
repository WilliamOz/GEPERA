import SiteChrome from "@/components/SiteChrome";
import { PageIntro, Section } from "@/components/Blocks";
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
      <PageIntro eyebrow={page.eyebrow} title={page.title} lead={page.intro} />
      <Section>
        <div className="cards-grid-next two">
          {(page.sections || []).map((section) => (
            <article className="content-card" key={section.title}>
              {section.image && <img src={section.image.startsWith("/") ? section.image : `/${section.image}`} alt="" />}
              <div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </SiteChrome>
  );
}
