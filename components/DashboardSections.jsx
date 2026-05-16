import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LibraryBig,
  MapPinned,
  MessageCircle,
  Search,
  Target,
  UsersRound
} from "lucide-react";
import { ActionSwiper, ImageSwiper, PublicationSwiper } from "./SwiperShowcase";
import { AnimatedGradientText, MagicCard, MetricCard, SectionTitle, TextLink } from "./MagicUI";

export function HomeDashboard({ data }) {
  return (
    <>
      <HeroDashboard data={data} />
      <SobreDashboard data={data} />
      <ObjetivosDashboard data={data} />
      <PesquisaDashboard data={data} />
      <PesquisadoresDashboard data={data} />
      <AcoesDashboard data={data} />
      <PublicacoesDashboard data={data} />
    </>
  );
}

export function HeroDashboard({ data }) {
  const pesquisadores = data.pages.pesquisadores.researchers || [];
  const publicacoes = data.pages.acoes.publications || [];
  const acoes = data.pages.acoes.actions || [];
  const linhas = data.pages.pesquisa.lines || [];

  return (
    <section className="dashboard-section hero-dashboard fp-section" id="inicio">
      <div className="dashboard-wrap hero-grid">
        <MagicCard className="hero-panel anime-hero">
          <div className="hero-logo-line">
            <img src={data.settings.logo} alt="" />
            <div>
              <span>{data.settings.abbreviation}</span>
              <strong>{data.settings.siteName}</strong>
            </div>
          </div>
          <h1>
            Ensino Religioso na Amazônia com <AnimatedGradientText>pesquisa, formação e diálogo</AnimatedGradientText>.
          </h1>
          <p>{data.pages.sobre.paragraphs?.[0]}</p>
          <div className="hero-actions">
            <a href="/pesquisa">Conheça a pesquisa</a>
            <a href="/publicacoes">Ver publicações</a>
          </div>
        </MagicCard>

        <div className="metric-grid">
          <MetricCard label="Pesquisadores" value={pesquisadores.length} detail="integrantes cadastrados" icon={UsersRound} />
          <MetricCard label="Linhas" value={linhas.length} detail="frentes de pesquisa" icon={Search} />
          <MetricCard label="Ações" value={acoes.length} detail="atividades acadêmicas" icon={CalendarDays} />
          <MetricCard label="Publicações" value={publicacoes.length} detail="materiais disponíveis" icon={LibraryBig} />
        </div>

        <MagicCard className="next-card anime-card">
          <span>Em destaque</span>
          <h2>{acoes[0]?.title || data.pages.acoes.title}</h2>
          <p>{acoes[0]?.description || data.pages.acoes.intro}</p>
          <TextLink href="/acoes">Ver ações</TextLink>
        </MagicCard>
      </div>
    </section>
  );
}

export function SobreDashboard({ data, compact = false }) {
  const page = data.pages.sobre;
  return (
    <section className={`dashboard-section fp-section ${compact ? "is-compact" : ""}`} id="sobre">
      <div className="dashboard-wrap section-grid">
        <SectionTitle eyebrow="Sobre" title={page.title} lead="Quem somos" />
        <MagicCard className="media-panel anime-card">
          <ImageSwiper images={page.carousel} />
        </MagicCard>
        <div className="text-stack">
          {page.paragraphs.map((text) => (
            <MagicCard key={text} className="text-card anime-card">
              <p>{text}</p>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ObjetivosDashboard({ data, compact = false }) {
  const page = data.pages.objetivos;
  return (
    <section className={`dashboard-section fp-section ${compact ? "is-compact" : ""}`} id="objetivos">
      <div className="dashboard-wrap">
        <SectionTitle eyebrow="Objetivos & Metas" title={page.title} lead={page.general} />
        <div className="objective-layout">
          <MagicCard className="focus-card anime-card">
            <Target size={38} />
            <span>Objetivo geral</span>
            <p>{page.general}</p>
          </MagicCard>
          <div className="dashboard-card-grid">
            {page.specific.map((item, index) => (
              <MagicCard key={item} className="info-card anime-card">
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <p>{item}</p>
              </MagicCard>
            ))}
          </div>
        </div>
        <div className="goal-strip">
          {page.goals.map((goal) => (
            <MagicCard key={goal} className="goal-card anime-card">
              <GraduationCap size={22} />
              <p>{goal}</p>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PesquisaDashboard({ data, compact = false }) {
  const page = data.pages.pesquisa;
  const mapImage = page.images?.find((item) => item.image?.includes("mapa")) || page.images?.[0];
  return (
    <section className={`dashboard-section fp-section ${compact ? "is-compact" : ""}`} id="pesquisa">
      <div className="dashboard-wrap research-layout">
        <SectionTitle eyebrow="Pesquisa" title={page.title} lead={page.tabs?.[0]?.body} />
        <MagicCard className="research-map-card anime-card">
          {mapImage && <img src={mapImage.image} alt={mapImage.caption || page.title} />}
        </MagicCard>
        <div className="research-lines">
          {page.lines.map((line) => (
            <MagicCard key={line.title} className="line-card anime-card">
              <Search size={26} />
              <h3>{line.title}</h3>
              <p>{line.body}</p>
            </MagicCard>
          ))}
          <MagicCard className="line-card muted-card anime-card">
            <MapPinned size={26} />
            <h3>{page.tabs?.[2]?.title}</h3>
            <p>{page.tabs?.[2]?.body}</p>
          </MagicCard>
        </div>
      </div>
    </section>
  );
}

export function PesquisadoresDashboard({ data, compact = false }) {
  const page = data.pages.pesquisadores;
  const coordinators = page.researchers.filter((person) => person.role === "Coordenadores do GEPERA");
  const researchers = page.researchers.filter((person) => person.role !== "Coordenadores do GEPERA");
  return (
    <section className={`dashboard-section fp-section ${compact ? "is-compact" : ""}`} id="pesquisadores">
      <div className="dashboard-wrap">
        <SectionTitle eyebrow="Equipe" title={page.title} lead={page.lead || "Pesquisadores vinculados ao GEPERA"} />
        <div className="people-block">
          <div className="people-column">
            <h3>Coordenadores</h3>
            {coordinators.map((person) => (
              <PersonCard key={person.name} person={person} coordinator logo={data.settings.logo} />
            ))}
          </div>
          <div className="people-column researchers-column">
            <h3>Pesquisadores</h3>
            <div className="people-grid">
              {researchers.map((person) => (
                <PersonCard key={person.name} person={person} logo={data.settings.logo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AcoesDashboard({ data, compact = false }) {
  const page = data.pages.acoes;
  return (
    <section className={`dashboard-section fp-section ${compact ? "is-compact" : ""}`} id="acoes">
      <div className="dashboard-wrap">
        <SectionTitle eyebrow="Simpósio | Seminário" title={page.title} lead={page.intro} />
        <ActionSwiper actions={page.actions} />
      </div>
    </section>
  );
}

export function PublicacoesDashboard({ data, compact = false }) {
  const publications = data.pages.acoes.publications || [];
  const page = data.pages.publicacoes || {};
  return (
    <section className={`dashboard-section fp-section ${compact ? "is-compact" : ""}`} id="publicacoes">
      <div className="dashboard-wrap">
        <SectionTitle eyebrow="Biblioteca" title={page.title || "Publicações"} lead={page.lead || "Artigos"} />
        <PublicationSwiper publications={publications} />
      </div>
    </section>
  );
}

export function CustomContentDashboard({ data, page }) {
  return (
    <section className="dashboard-section is-compact">
      <div className="dashboard-wrap">
        <SectionTitle eyebrow={page.eyebrow} title={page.title} lead={page.intro} />
        <div className="dashboard-card-grid">
          {(page.sections || []).map((section) => (
            <MagicCard className="showcase-card anime-card" key={section.title}>
              {section.image && <img src={section.image.startsWith("/") ? section.image : `/${section.image}`} alt="" />}
              <div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function PersonCard({ person, coordinator = false, logo }) {
  const photo = person.photo || logo;
  return (
    <MagicCard href={person.lattes || "#"} className={`person-card anime-card ${coordinator ? "is-coordinator" : ""}`} target="_blank" rel="noreferrer">
      <img src={photo} alt="" />
      <div>
        <span>{person.role}</span>
        <h4>{person.name}</h4>
        {person.institution && <p>{person.institution}</p>}
      </div>
    </MagicCard>
  );
}
