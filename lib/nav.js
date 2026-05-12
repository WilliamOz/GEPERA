export function visibleNav(data) {
  return (data.nav || []).filter((item) => item.visible !== false);
}

export function hrefFor(item) {
  if (item.type === "custom") return `/pagina/${item.slug}`;
  const map = {
    home: "/",
    sobre: "/sobre",
    objetivos: "/objetivos",
    pesquisa: "/pesquisa",
    pesquisadores: "/pesquisadores",
    acoes: "/acoes",
    publicacoes: "/publicacoes"
  };
  return map[item.id] || "/";
}
