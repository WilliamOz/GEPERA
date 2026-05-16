"use client";

import { useEffect, useRef } from "react";

export default function FullPageSections({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const shell = ref.current;
    if (!shell) return undefined;

    function onKeyDown(event) {
      if (!["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) return;
      const sections = Array.from(shell.querySelectorAll(".fp-section"));
      const currentIndex = Math.max(
        0,
        sections.findIndex((section) => Math.abs(section.getBoundingClientRect().top) < window.innerHeight * 0.42)
      );
      const direction = event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
      const next = sections[Math.min(sections.length - 1, Math.max(0, currentIndex + direction))];
      if (next) {
        event.preventDefault();
        next.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div ref={ref} className="fullpage-shell">
      {children}
    </div>
  );
}
