"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GsapExperience() {
  const pathname = usePathname();

  useEffect(() => {
    let context;
    let scrollTrigger;
    let resizeObserver;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return undefined;

    async function init() {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap || gsapModule.default || gsapModule;
      scrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(scrollTrigger);

      context = gsap.context(() => {
        const refresh = () => scrollTrigger.refresh();
        const butterOuter = document.querySelector(".butter-outer");
        const butterInner = document.querySelector(".butter-inner");

        if (document.documentElement.classList.contains("butter-scroll-enabled") && butterOuter && butterInner) {
          scrollTrigger.scrollerProxy(window, {
            scrollTop(value) {
              if (arguments.length) {
                window.scrollTo(0, value);
              }
              return window.scrollY || window.pageYOffset;
            },
            getBoundingClientRect() {
              return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: "transform"
          });
        }

        gsap.fromTo(
          ".nav-shell",
          { y: -18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
        );

        if (window.matchMedia("(min-width: 981px)").matches) {
          gsap.to(".nav-shell", {
            minHeight: 76,
            paddingTop: 12,
            paddingBottom: 12,
            boxShadow: "0 12px 34px rgba(31, 70, 50, 0.1)",
            ease: "none",
            scrollTrigger: {
              start: 0,
              end: 170,
              scrub: true
            }
          });

          gsap.to(".brand-lockup img", {
            width: 64,
            height: 48,
            ease: "none",
            scrollTrigger: {
              start: 0,
              end: 170,
              scrub: true
            }
          });
        }

        gsap.fromTo(
          ".hero-copy-next .kicker, .hero-copy-next h1",
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.14 }
        );

        gsap.to(".hero-next", {
          backgroundPosition: "52% 58%",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-next",
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });

        gsap.to("body", {
          "--pattern-shift": "64px",
          ease: "none",
          scrollTrigger: {
            trigger: ".butter-inner",
            start: "top top",
            end: "bottom bottom",
            scrub: true
          }
        });

        gsap.utils
          .toArray(
            ".section-head-next, .home-feature-card, .glass-card, .content-card, .researcher-model-card, .publication-card-model, .tab-system, .research-map-only"
          )
          .forEach((element, index) => {
            if (element.closest(".site-footer-next")) return;
            gsap.fromTo(
              element,
              { y: 34, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.75,
                ease: "power3.out",
                delay: (index % 4) * 0.035,
                scrollTrigger: {
                  trigger: element,
                  start: "top 88%",
                  toggleActions: "play none none reverse"
                }
              }
            );
          });

        gsap.fromTo(
          ".research-map-only img",
          { scale: 0.92, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".research-map-only",
              start: "top 82%",
              toggleActions: "play none none reverse"
            }
          }
        );

        addHover(gsap, ".researcher-model-card", { y: -4, scale: 1.015 });
        addHover(gsap, ".publication-card-model", { y: -5, rotateY: 2, scale: 1.012 });
        addHover(gsap, ".action-card-next", { y: -4, scale: 1.01 });

        document.querySelectorAll(".publication-card-model img").forEach((image) => {
          const card = image.closest(".publication-card-model");
          card?.addEventListener("mouseenter", () => gsap.to(image, { y: -5, rotate: -1, duration: 0.28, ease: "power2.out" }));
          card?.addEventListener("mouseleave", () => gsap.to(image, { y: 0, rotate: 0, duration: 0.28, ease: "power2.out" }));
        });

        document.querySelectorAll(".media-carousel").forEach((carousel) => {
          if (carousel.closest(".site-footer-next")) return;
          gsap.fromTo(
            carousel,
            { x: -24, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: carousel,
                start: "top 86%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });

        const mobileDrawer = document.querySelector(".mobile-drawer");
        if (mobileDrawer) {
          const observer = new MutationObserver(() => {
            if (mobileDrawer.classList.contains("open")) {
              gsap.fromTo(
                ".mobile-drawer nav a, .drawer-social a",
                { x: 24, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.045 }
              );
            }
          });
          observer.observe(mobileDrawer, { attributes: true, attributeFilter: ["class"] });
        }

        resizeObserver = new ResizeObserver(refresh);
        resizeObserver.observe(document.body);
        window.setTimeout(refresh, 500);
      });
    }

    init();

    return () => {
      resizeObserver?.disconnect();
      scrollTrigger?.getAll().forEach((trigger) => trigger.kill());
      context?.revert();
    };
  }, [pathname]);

  return null;
}

function addHover(gsap, selector, vars) {
  document.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("mouseenter", () => gsap.to(element, { ...vars, duration: 0.24, ease: "power2.out" }));
    element.addEventListener("mouseleave", () => gsap.to(element, { y: 0, scale: 1, rotateY: 0, duration: 0.24, ease: "power2.out" }));
  });
}
