"use client";

import { useEffect, useMemo, useState } from "react";

const sections = [
  ["identity", "Identidade"],
  ["pages", "Páginas"],
  ["actions", "Ações"],
  ["publications", "Publicações"],
  ["researchers", "Pesquisadores"],
  ["goals", "Objetivos"],
  ["raw", "JSON avançado"]
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [csrf, setCsrf] = useState("");
  const [data, setData] = useState(null);
  const [active, setActive] = useState("identity");
  const [status, setStatus] = useState("Carregando...");
  const [login, setLogin] = useState({ username: "admin", password: "" });
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    boot();
  }, []);

  async function boot() {
    const session = await fetch("/api/admin/session").then((r) => r.ok ? r.json() : null);
    if (!session) {
      setStatus("Entre para editar o portal.");
      return;
    }
    setUser(session.user);
    setCsrf(session.csrfToken);
    const content = await fetch("/api/admin/content").then((r) => r.json());
    setData(content);
    setJsonText(JSON.stringify(content, null, 2));
    setStatus("Tudo pronto.");
  }

  async function doLogin(event) {
    event.preventDefault();
    setStatus("Verificando acesso...");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login)
    });
    if (!response.ok) {
      setStatus("Usuário ou senha inválidos.");
      return;
    }
    await boot();
  }

  async function save() {
    setStatus("Salvando...");
    const payload = active === "raw" ? JSON.parse(jsonText) : data;
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setStatus("Erro ao salvar.");
      return;
    }
    setData(payload);
    setJsonText(JSON.stringify(payload, null, 2));
    setStatus("Salvo com segurança no banco e no JSON.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setData(null);
    setCsrf("");
    setStatus("Sessão encerrada.");
  }

  function update(path, value) {
    setData((current) => {
      const next = structuredClone(current);
      let target = next;
      const keys = path.split(".");
      keys.slice(0, -1).forEach((key) => { target = target[key]; });
      target[keys.at(-1)] = value;
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function updateArrayText(path, text) {
    update(path, text.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean));
  }

  function addPublication() {
    setData((current) => {
      const next = structuredClone(current);
      next.pages.acoes.publications.push({
        title: "Nova publicação",
        type: "Artigo",
        authors: "",
        year: "2026",
        venue: "",
        summary: "",
        link: "",
        cover: ""
      });
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function addAction() {
    setData((current) => {
      const next = structuredClone(current);
      next.pages.acoes.actions.push({ title: "Nova ação", category: "Eventos", date: "2026", location: "", description: "", link: "", images: [] });
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function addResearcher() {
    setData((current) => {
      const next = structuredClone(current);
      next.pages.pesquisadores.researchers.push({ name: "Novo pesquisador", role: "Pesquisador", area: "", photo: "", bio: "", lattes: "", email: "" });
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function addPage() {
    setData((current) => {
      const next = structuredClone(current);
      const slug = uniqueSlug(next.customPages || [], "nova-pagina");
      const page = {
        id: `custom-${slug}`,
        slug,
        label: "Nova página",
        eyebrow: "Página acadêmica",
        title: "Nova página",
        intro: "Edite este conteúdo no painel administrativo.",
        sections: [{ title: "Nova seção", body: "Texto da seção.", image: "" }]
      };
      next.customPages = [...(next.customPages || []), page];
      next.nav = [...(next.nav || []), { id: page.id, label: page.label, type: "custom", slug, visible: true }];
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  async function upload(file, path) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
      body: JSON.stringify({ fileName: file.name, dataUrl })
    });
    if (!response.ok) {
      setStatus("Upload recusado.");
      return;
    }
    const payload = await response.json();
    update(path, payload.url);
  }

  const panel = useMemo(() => {
    if (!data) return null;
    if (active === "identity") return <IdentityPanel data={data} update={update} upload={upload} updateArrayText={updateArrayText} />;
    if (active === "pages") return <PagesPanel data={data} update={update} addPage={addPage} />;
    if (active === "actions") return <ActionsPanel data={data} update={update} addAction={addAction} />;
    if (active === "publications") return <PublicationsPanel data={data} update={update} addPublication={addPublication} upload={upload} />;
    if (active === "researchers") return <ResearchersPanel data={data} update={update} addResearcher={addResearcher} upload={upload} />;
    if (active === "goals") return <GoalsPanel data={data} update={update} updateArrayText={updateArrayText} />;
    return <textarea className="json-editor" value={jsonText} onChange={(event) => setJsonText(event.target.value)} />;
  }, [active, data, jsonText]);

  if (!user) {
    return (
      <main className="admin-next-login">
        <form className="admin-login-card" onSubmit={doLogin}>
          <span>GEPERA</span>
          <h1>Acesso administrativo</h1>
          <p>Gerencie o portal acadêmico com sessão protegida, cookie HttpOnly e backend com banco SQLite.</p>
          <input value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} placeholder="Usuário" />
          <input value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} placeholder="Senha" type="password" />
          <button type="submit">Entrar</button>
          <small>{status}</small>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-next-shell">
      <aside>
        <strong>GEPERA Admin</strong>
        {sections.map(([id, label]) => (
          <button key={id} className={active === id ? "active" : ""} type="button" onClick={() => setActive(id)}>
            {label}
          </button>
        ))}
        <button type="button" onClick={logout}>Sair</button>
      </aside>
      <section>
        <div className="admin-next-topbar">
          <div>
            <h1>{sections.find(([id]) => id === active)?.[1]}</h1>
            <p>{status}</p>
          </div>
          <button type="button" onClick={save}>Salvar alterações</button>
        </div>
        {panel}
      </section>
    </main>
  );
}

function IdentityPanel({ data, update, upload, updateArrayText }) {
  return (
    <div className="admin-form-grid">
      <Field label="Nome completo" value={data.settings.siteName} onChange={(v) => update("settings.siteName", v)} />
      <Field label="Sigla" value={data.settings.abbreviation} onChange={(v) => update("settings.abbreviation", v)} />
      <Area label="Descrição" value={data.settings.description} onChange={(v) => update("settings.description", v)} />
      <Area label="Contatos" value={(data.settings.contactLines || []).join("\n\n")} onChange={(v) => updateArrayText("settings.contactLines", v)} />
      <UploadField label="Logo" value={data.settings.logo} onChange={(v) => update("settings.logo", v)} onUpload={(file) => upload(file, "settings.logo")} />
    </div>
  );
}

function ActionsPanel({ data, update, addAction }) {
  return (
    <div className="admin-stack">
      <button type="button" onClick={addAction}>Adicionar ação</button>
      {data.pages.acoes.actions.map((action, index) => (
        <div className="admin-editor-card" key={`${action.title}-${index}`}>
          <Field label="Título" value={action.title} onChange={(v) => update(`pages.acoes.actions.${index}.title`, v)} />
          <Field label="Categoria" value={action.category} onChange={(v) => update(`pages.acoes.actions.${index}.category`, v)} />
          <Field label="Ano/data" value={action.date} onChange={(v) => update(`pages.acoes.actions.${index}.date`, v)} />
          <Area label="Descrição" value={action.description} onChange={(v) => update(`pages.acoes.actions.${index}.description`, v)} />
          <Area label="Imagens: uma por linha no formato URL | legenda" value={(action.images || []).map((item) => `${item.image} | ${item.caption || ""}`).join("\n")} onChange={(v) => update(`pages.acoes.actions.${index}.images`, parseImages(v))} />
        </div>
      ))}
    </div>
  );
}

function PagesPanel({ data, update, addPage }) {
  return (
    <div className="admin-stack">
      <button type="button" onClick={addPage}>Adicionar aba/página</button>
      {(data.nav || []).map((item, index) => (
        <div className="admin-editor-card" key={`${item.id}-${index}`}>
          <Field label="Nome no menu" value={item.label} onChange={(v) => update(`nav.${index}.label`, v)} />
          <label>
            <span>Visível</span>
            <input
              type="checkbox"
              checked={item.visible !== false}
              onChange={(event) => update(`nav.${index}.visible`, event.target.checked)}
            />
          </label>
        </div>
      ))}
      {(data.customPages || []).map((page, index) => (
        <div className="admin-editor-card" key={page.id}>
          <Field label="Nome no menu" value={page.label} onChange={(v) => {
            update(`customPages.${index}.label`, v);
            const navIndex = data.nav.findIndex((item) => item.id === page.id);
            if (navIndex >= 0) update(`nav.${navIndex}.label`, v);
          }} />
          <Field label="Slug" value={page.slug} onChange={(v) => update(`customPages.${index}.slug`, slugify(v))} />
          <Field label="Selo" value={page.eyebrow} onChange={(v) => update(`customPages.${index}.eyebrow`, v)} />
          <Field label="Título" value={page.title} onChange={(v) => update(`customPages.${index}.title`, v)} />
          <Area label="Introdução" value={page.intro} onChange={(v) => update(`customPages.${index}.intro`, v)} />
          <Area
            label="Seções: use título || texto || imagem"
            value={(page.sections || []).map((section) => `${section.title} || ${section.body} || ${section.image || ""}`).join("\n")}
            onChange={(v) => update(`customPages.${index}.sections`, parseSections(v))}
          />
        </div>
      ))}
    </div>
  );
}

function PublicationsPanel({ data, update, addPublication, upload }) {
  return (
    <div className="admin-stack">
      <button type="button" onClick={addPublication}>Adicionar publicação</button>
      {data.pages.acoes.publications.map((publication, index) => (
        <div className="admin-editor-card" key={`${publication.title}-${index}`}>
          <Field label="Título" value={publication.title} onChange={(v) => update(`pages.acoes.publications.${index}.title`, v)} />
          <Field label="Tipo" value={publication.type} onChange={(v) => update(`pages.acoes.publications.${index}.type`, v)} />
          <Field label="Ano" value={publication.year} onChange={(v) => update(`pages.acoes.publications.${index}.year`, v)} />
          <Field label="Autores" value={publication.authors} onChange={(v) => update(`pages.acoes.publications.${index}.authors`, v)} />
          <Field label="Local/editora/periódico" value={publication.venue} onChange={(v) => update(`pages.acoes.publications.${index}.venue`, v)} />
          <UploadField label="Capa" value={publication.cover} onChange={(v) => update(`pages.acoes.publications.${index}.cover`, v)} onUpload={(file) => upload(file, `pages.acoes.publications.${index}.cover`)} />
          <UploadField label="PDF/link" value={publication.link} onChange={(v) => update(`pages.acoes.publications.${index}.link`, v)} onUpload={(file) => upload(file, `pages.acoes.publications.${index}.link`)} />
          <Area label="Resumo" value={publication.summary} onChange={(v) => update(`pages.acoes.publications.${index}.summary`, v)} />
        </div>
      ))}
    </div>
  );
}

function ResearchersPanel({ data, update, addResearcher, upload }) {
  return (
    <div className="admin-stack">
      <button type="button" onClick={addResearcher}>Adicionar pesquisador</button>
      {data.pages.pesquisadores.researchers.map((person, index) => (
        <div className="admin-editor-card" key={`${person.name}-${index}`}>
          <Field label="Nome" value={person.name} onChange={(v) => update(`pages.pesquisadores.researchers.${index}.name`, v)} />
          <Field label="Função" value={person.role} onChange={(v) => update(`pages.pesquisadores.researchers.${index}.role`, v)} />
          <Field label="Área" value={person.area} onChange={(v) => update(`pages.pesquisadores.researchers.${index}.area`, v)} />
          <UploadField label="Foto" value={person.photo} onChange={(v) => update(`pages.pesquisadores.researchers.${index}.photo`, v)} onUpload={(file) => upload(file, `pages.pesquisadores.researchers.${index}.photo`)} />
          <Field label="Lattes" value={person.lattes} onChange={(v) => update(`pages.pesquisadores.researchers.${index}.lattes`, v)} />
          <Area label="Biografia" value={person.bio} onChange={(v) => update(`pages.pesquisadores.researchers.${index}.bio`, v)} />
        </div>
      ))}
    </div>
  );
}

function GoalsPanel({ data, update, updateArrayText }) {
  return (
    <div className="admin-form-grid">
      <Area label="Objetivo geral" value={data.pages.objetivos.general} onChange={(v) => update("pages.objetivos.general", v)} />
      <Area label="Objetivos específicos" value={data.pages.objetivos.specific.join("\n\n")} onChange={(v) => updateArrayText("pages.objetivos.specific", v)} />
      <Area label="Metas" value={data.pages.objetivos.goals.join("\n\n")} onChange={(v) => updateArrayText("pages.objetivos.goals", v)} />
    </div>
  );
}

function Field({ label, value = "", onChange }) {
  return <label><span>{label}</span><input value={value || ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Area({ label, value = "", onChange }) {
  return <label className="wide"><span>{label}</span><textarea value={value || ""} onChange={(event) => onChange(event.target.value)} /></label>;
}

function UploadField({ label, value = "", onChange, onUpload }) {
  return (
    <label>
      <span>{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} />
      <input type="file" accept="image/*,.pdf" onChange={(event) => onUpload(event.target.files?.[0])} />
    </label>
  );
}

function parseImages(text) {
  return text.split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [image, ...caption] = line.split("|");
    return { image: image.trim(), caption: caption.join("|").trim() };
  });
}

function parseSections(text) {
  return text.split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [title, body, image] = line.split("||").map((part) => part.trim());
    return { title: title || "Seção", body: body || "", image: image || "" };
  });
}

function slugify(value) {
  return String(value || "pagina")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "pagina";
}

function uniqueSlug(pages, base) {
  let slug = slugify(base);
  let counter = 2;
  while (pages.some((page) => page.slug === slug)) {
    slug = `${slugify(base)}-${counter}`;
    counter += 1;
  }
  return slug;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
