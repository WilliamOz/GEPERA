import { ChevronRight, ExternalLink } from "lucide-react";

export default function ResearchersModel({ coordinators = [], researchers = [], logo = "" }) {
  return (
    <>
      <ResearchersPanel title="Coordenadores do GEPERA" people={coordinators} logo={logo} coordinator />
      <ResearchersPanel title="Pesquisadores" people={researchers} logo={logo} />
    </>
  );
}

function ResearchersPanel({ title, people, logo, coordinator = false }) {
  return (
    <div className="researchers-model-panel">
      <div className="researchers-model-head">
        <h2>{title}</h2>
      </div>
      <div className={`researchers-model-grid ${coordinator ? "coordinators-model-grid" : ""}`}>
        {people.map((person) => (
          <ResearcherCard key={person.name} person={person} logo={logo} coordinator={coordinator} />
        ))}
      </div>
    </div>
  );
}

function ResearcherCard({ person, logo, coordinator }) {
  const content = (
    <>
      <ResearcherPhoto person={person} logo={logo} />
      <span className="researcher-model-copy">
        <small>{coordinator ? "Coordenação" : person.role}</small>
        <strong>{person.name}</strong>
        {person.area && <em>{person.area}</em>}
      </span>
      <span className="researcher-model-arrow" aria-hidden="true">
        {person.lattes ? <ExternalLink size={18} /> : <ChevronRight size={20} />}
      </span>
    </>
  );

  if (!person.lattes) {
    return <div className={`researcher-model-card ${coordinator ? "is-coordinator" : ""}`}>{content}</div>;
  }

  return (
    <a
      className={`researcher-model-card ${coordinator ? "is-coordinator" : ""}`}
      href={person.lattes}
      target="_blank"
      rel="noreferrer"
      aria-label={`Abrir Currículo Lattes de ${person.name}`}
    >
      {content}
    </a>
  );
}

function ResearcherPhoto({ person, logo }) {
  return (
    <span className="researcher-model-photo">
      {person.photo ? (
        <img src={person.photo} alt={person.name} />
      ) : (
        <span className="researcher-model-fallback" aria-hidden="true">
          <img src={logo} alt="" />
        </span>
      )}
    </span>
  );
}
