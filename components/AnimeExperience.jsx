"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnimeExperience() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    async function run() {
      try {
        const { animate, stagger } = await import("animejs");
        if (cancelled) return;

        animate(".anime-hero", {
          opacity: [0, 1],
          translateY: [26, 0],
          duration: 720,
          ease: "outCubic"
        });

        animate(".anime-card", {
          opacity: [0, 1],
          translateY: [22, 0],
          scale: [0.98, 1],
          duration: 680,
          delay: stagger(70),
          ease: "outCubic"
        });

        const cards = document.querySelectorAll(".magic-card");
        cards.forEach((card) => {
          const onEnter = () => {
            animate(card, { translateY: -4, scale: 1.01, duration: 220, ease: "outQuad" });
          };
          const onLeave = () => {
            animate(card, { translateY: 0, scale: 1, duration: 260, ease: "outQuad" });
          };
          card.addEventListener("pointerenter", onEnter);
          card.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", onEnter);
            card.removeEventListener("pointerleave", onLeave);
          });
        });
      } catch (error) {
        console.error("Anime.js initialization failed", error);
      }
    }

    run();
    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
