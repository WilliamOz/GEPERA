import SiteChrome from "@/components/SiteChrome";
import { Hero, Section } from "@/components/Blocks";
import MediaCarousel from "@/components/MediaCarousel";
import { publicData } from "@/lib/content";
import { BookOpenCheck, GraduationCap, MessageCircle, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const data = publicData();
  const whatWeDo = [
    {
      title: "Pesquisa",
      body: data.pages.pesquisa.tabs?.[1]?.body || data.pages.pesquisa.tabs?.[0]?.body,
      Icon: Search
    },
    {
      title: "Formação",
      body: data.pages.objetivos.specific?.[1],
      Icon: GraduationCap
    },
    {
      title: "Produção",
      body: data.pages.objetivos.specific?.[2],
      Icon: BookOpenCheck
    },
    {
      title: "Diálogo",
      body: data.pages.objetivos.specific?.[3],
      Icon: MessageCircle
    }
  ];

  return (
    <SiteChrome data={data}>
      <Hero data={data} />
      <Section title="Sobre o GEPERA">
        <div className="two-col-next home-about-section">
          <MediaCarousel images={data.pages.sobre.carousel} title="GEPERA" />
          <div className="text-column-next">
            {data.pages.sobre.paragraphs.map((text) => <p key={text}>{text}</p>)}
          </div>
        </div>
      </Section>
      <Section title="O que fazemos">
        <div className="home-feature-row">
          {whatWeDo.map(({ title, body, Icon }) => (
            <article className="home-feature-card" key={title}>
              <Icon size={46} strokeWidth={1.8} />
              <h3>{title}</h3>
              <p>{body}</p>
              <a href="/pesquisa">Saiba mais</a>
            </article>
          ))}
        </div>
      </Section>
    </SiteChrome>
  );
}
