"use client";

import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ArrowUpRight } from "lucide-react";
import { MagicCard } from "./MagicUI";

export function ImageSwiper({ images = [] }) {
  const clean = images.filter((item) => item?.image);
  if (!clean.length) return null;

  return (
    <Swiper
      className="image-swiper"
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3200, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      spaceBetween={18}
      slidesPerView={1}
    >
      {clean.map((item) => (
        <SwiperSlide key={item.image}>
          <figure className="swiper-figure">
            <img src={item.image} alt={item.caption || item.title || ""} />
            {(item.title || item.caption) && (
              <figcaption>
                <strong>{item.title}</strong>
                <span>{item.caption}</span>
              </figcaption>
            )}
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function ActionSwiper({ actions = [] }) {
  return (
    <Swiper
      className="card-swiper"
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3600, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      spaceBetween={18}
      breakpoints={{
        0: { slidesPerView: 1.04 },
        760: { slidesPerView: 2 },
        1180: { slidesPerView: 3 }
      }}
    >
      {actions.map((action) => {
        const cover = action.images?.[0]?.image;
        return (
          <SwiperSlide key={action.title}>
            <MagicCard className="showcase-card action-showcase anime-card">
              {cover && <img src={cover} alt="" />}
              <div>
                <span>Ação</span>
                <h3>{action.title}</h3>
                {action.description && <p>{action.description}</p>}
              </div>
            </MagicCard>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

export function PublicationSwiper({ publications = [] }) {
  return (
    <Swiper
      className="card-swiper"
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3900, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      spaceBetween={18}
      breakpoints={{
        0: { slidesPerView: 1.08 },
        760: { slidesPerView: 2.2 },
        1180: { slidesPerView: 3.4 }
      }}
    >
      {publications.map((publication) => (
        <SwiperSlide key={publication.title}>
          <MagicCard href={publication.link || "#"} className="showcase-card publication-showcase anime-card" target="_blank" rel="noreferrer">
            {publication.cover && <img src={publication.cover} alt="" />}
            <div>
              <span>{publication.type || "Publicação"}</span>
              <h3>{publication.title}</h3>
              {publication.venue && <p>{publication.venue}</p>}
              <strong>
                Acessar
                <ArrowUpRight size={16} />
              </strong>
            </div>
          </MagicCard>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
