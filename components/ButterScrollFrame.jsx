"use client";

import { useEffect, useRef } from "react";

export default function ButterScrollFrame({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const canUseButter =
      window.matchMedia("(min-width: 981px) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseButter || !outerRef.current || !innerRef.current) return undefined;

    let cancelled = false;
    let resizeObserver;
    const refresh = () => window.dispatchEvent(new Event("resize"));

    async function initButterScroll() {
      const jqueryModule = await import("jquery");
      const butterModule = await import("butter-scroll");
      if (cancelled || !outerRef.current || !innerRef.current) return;

      const $ = jqueryModule.default || jqueryModule;
      const ButterScroll = butterModule.default || butterModule;

      window.$ = $;
      window.jQuery = $;

      document.querySelectorAll(".scroller").forEach((node) => node.remove());
      document.documentElement.classList.add("butter-scroll-enabled");

      window.__geperaButterScroll = new ButterScroll({
        $containerEl: $(outerRef.current),
        $elToScroll: $(innerRef.current),
        scrollEase: 0.12,
        maxDepthOffset: 180
      });

      resizeObserver = new ResizeObserver(refresh);
      resizeObserver.observe(innerRef.current);
      window.addEventListener("load", refresh);
      window.requestAnimationFrame(refresh);
      window.setTimeout(refresh, 450);
    }

    initButterScroll();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("load", refresh);
      document.documentElement.classList.remove("butter-scroll-enabled");
      document.querySelectorAll(".scroller").forEach((node) => node.remove());
      if (outerRef.current) outerRef.current.removeAttribute("style");
      if (innerRef.current) innerRef.current.removeAttribute("style");
      delete window.__geperaButterScroll;
    };
  }, []);

  return (
    <div className="butter-outer js-butter-outer" ref={outerRef}>
      <div className="butter-inner js-butter-inner" ref={innerRef}>
        {children}
      </div>
    </div>
  );
}
