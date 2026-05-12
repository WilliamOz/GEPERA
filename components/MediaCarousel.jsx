"use client";

import { useEffect, useState } from "react";

export default function MediaCarousel({ images = [], title = "" }) {
  const [index, setIndex] = useState(0);
  const clean = images.filter((item) => item?.image);

  useEffect(() => {
    if (clean.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % clean.length), 3600);
    return () => window.clearInterval(timer);
  }, [clean.length]);

  if (!clean.length) return <div className="media-empty">GEPERA</div>;

  return (
    <div className="media-carousel" data-count={clean.length}>
      <div
        className="media-track"
        style={{
          width: `${clean.length * 100}%`,
          transform: `translateX(-${index * (100 / clean.length)}%)`
        }}
      >
        {clean.map((item, itemIndex) => (
          <figure
            key={`${item.image}-${itemIndex}`}
            style={{
              flex: `0 0 ${100 / clean.length}%`,
              minWidth: `${100 / clean.length}%`
            }}
          >
            <img src={item.image} alt={item.caption || title} />
          </figure>
        ))}
      </div>
      {clean.length > 1 && (
        <div className="media-dots" aria-label="Controle do carrossel">
          {clean.map((item, itemIndex) => (
            <button
              key={`${item.image}-dot`}
              type="button"
              className={itemIndex === index ? "active" : ""}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Ir para imagem ${itemIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
