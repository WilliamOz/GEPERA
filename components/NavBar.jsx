"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Camera,
  Home,
  Info,
  Mail,
  Menu,
  Search,
  Target,
  UsersRound,
  Video,
  X
} from "lucide-react";
import { hrefFor, visibleNav } from "@/lib/nav";

export default function NavBar({ data }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const nav = visibleNav(data);
  const mobileItems = [
    nav.find((item) => item.id === "home"),
    nav.find((item) => item.id === "pesquisa"),
    nav.find((item) => item.id === "acoes"),
    nav.find((item) => item.id === "publicacoes")
  ].filter(Boolean);

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

        <nav className="nav-links" aria-label="Navegação principal">
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

      <nav className="mobile-bottom-nav" aria-label="Navegação inferior">
        {mobileItems.map((item) => {
          const Icon = iconFor(item.id);
          return (
            <a key={item.id} className={isActive(item, pathname) ? "is-active" : ""} href={hrefFor(item)}>
              <Icon size={21} />
              <span>{shortLabel(item)}</span>
            </a>
          );
        })}
        <a href="#contato">
          <Mail size={21} />
          <span>Contato</span>
        </a>
      </nav>
    </>
  );
}

function Brand({ data }) {
  return (
    <a className="brand-lockup" href="/" aria-label="Página inicial do GEPERA">
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
    publicacoes: BookOpen
  };
  return map[id] || Home;
}

function isActive(item, pathname = "/") {
  const href = hrefFor(item);
  if (href === "/") return pathname === "/";
  return pathname === href || pathname?.startsWith(`${href}/`);
}

function socialIcon(label) {
  if (label?.toLowerCase().includes("instagram")) return Camera;
  if (label?.toLowerCase().includes("youtube")) return Video;
  return Mail;
}

function shortLabel(item) {
  const labels = {
    home: "Início",
    pesquisa: "Pesquisar",
    acoes: "Eventos",
    publicacoes: "Publicações"
  };
  return labels[item.id] || item.label;
}
