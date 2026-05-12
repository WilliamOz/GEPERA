"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function PublicationGrid({ publications = [] }) {
  const [type, setType] = useState("Todas");
  const types = useMemo(
    () => ["Todas", ...Array.from(new Set(publications.map((item) => item.type).filter(Boolean)))],
    [publications]
  );
  const filtered = type === "Todas" ? publications : publications.filter((item) => item.type === type);

  return (
    <div className="publication-area publication-area-model">
      {types.length > 2 && (
        <div className="filter-row publication-filter-model">
          {types.map((item) => (
            <button key={item} className={item === type ? "active" : ""} type="button" onClick={() => setType(item)}>
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="publication-grid-next publication-grid-model">
        {filtered.map((publication) => {
          const meta = [publication.type, publication.year].filter(Boolean).join(" · ");
          return (
            <a key={publication.title} className="publication-card-model" href={publication.link || "#"} target="_blank" rel="noreferrer">
              <figure className="publication-cover-model">
                {publication.cover ? <img src={publication.cover} alt="" /> : <div className="media-empty">PDF</div>}
              </figure>
              <div className="publication-copy-model">
                {meta && <span>{meta}</span>}
                <h3>{publication.title}</h3>
                {publication.venue && <p>{publication.venue}</p>}
                <strong>
                  Saiba mais
                  <ArrowRight size={15} />
                </strong>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
