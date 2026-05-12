"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Home,
  Info,
  Mail,
  Menu,
  Search,
  Target,
  UsersRound,
  X
} from "lucide-react";
import { hrefFor, visibleNav } from "@/lib/nav";

export default function NavBar({ data }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const nav = visibleNav(data);
  const mobileItems = [...nav, { id: "contato", label: "Contato", href: "#contato" }];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <header className={`nav-shell ${scrolled ? "is-scrolled" : ""}`}>
        <Brand data={data} />

        <button className="menu-button" type="button" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu size={26} strokeWidth={2.2} />
        </button>
        <span className="menu-visual" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>

        <nav className="nav-links" aria-label="Navegacao principal">
          {nav.map((item) => (
            <a key={item.id} className={isActive(item, pathname) ? "is-active" : ""} href={hrefFor(item)}>
              {item.label}
            </a>
          ))}
          <a className={`admin-chip ${pathname?.startsWith("/admin") ? "is-active" : ""}`} href="/admin">Admin</a>
        </nav>
      </header>

      <aside className={`mobile-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <button className="drawer-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X size={30} />
        </button>
        <Brand data={data} />
        <nav aria-label="Menu mobile">
          {nav.map((item) => {
            const Icon = iconFor(item.id);
            return (
              <a
                key={item.id}
                className={isActive(item, pathname) ? "is-active" : ""}
                href={hrefFor(item)}
                onClick={() => setOpen(false)}
              >
                <Icon size={27} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="drawer-social">
          {data.settings.socialLinks?.map((link) => {
            const Icon = socialIcon(link.label);
            return (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label}>
                <Icon size={28} />
              </a>
            );
          })}
          <a href="#contato" onClick={() => setOpen(false)} aria-label="Contato">
            <Mail size={28} />
          </a>
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Navegacao inferior">
        {mobileItems.map((item) => {
          const Icon = iconFor(item.id);
          return (
            <a key={item.id} className={isActive(item, pathname) ? "is-active" : ""} href={item.id === "contato" ? item.href : hrefFor(item)}>
              <Icon size={21} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}

function Brand({ data }) {
  return (
    <a className="brand-lockup" href="/" aria-label="Pagina inicial do GEPERA">
      {data.settings.logo ? <img src={data.settings.logo} alt="" /> : <span>G</span>}
      <strong>
        <span>{data.settings.abbreviation}</span>
        <small>{data.settings.siteName}</small>
      </strong>
    </a>
  );
}

function iconFor(id) {
  const map = {
    home: Home,
    sobre: Info,
    objetivos: Target,
    pesquisa: Search,
    pesquisadores: UsersRound,
    acoes: CalendarDays,
    publicacoes: BookOpen,
    contato: Mail
  };
  return map[id] || Home;
}

function isActive(item, pathname = "/") {
  if (item.id === "contato") return false;
  const href = hrefFor(item);
  if (href === "/") return pathname === "/";
  return pathname === href || pathname?.startsWith(`${href}/`);
}

function socialIcon(label) {
  if (label?.toLowerCase().includes("instagram")) return InstagramIcon;
  if (label?.toLowerCase().includes("youtube")) return YoutubeIcon;
  return Mail;
}

function InstagramIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M21.2 7.7c-.2-.9-.9-1.6-1.8-1.8C17.8 5.5 12 5.5 12 5.5s-5.8 0-7.4.4c-.9.2-1.6.9-1.8 1.8-.4 1.6-.4 4.9-.4 4.9s0 3.3.4 4.9c.2.9.9 1.6 1.8 1.8 1.6.4 7.4.4 7.4.4s5.8 0 7.4-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.9.4-4.9s0-3.3-.4-4.9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m10.2 15.4 5-2.8-5-2.8v5.6Z" fill="currentColor" />
    </svg>
  );
}
