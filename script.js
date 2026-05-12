(function () {
    "use strict";

    const STORAGE_KEY = "gepera.site.data.v2";
    const FALLBACK_USER = "admin";
    const FALLBACK_PASS = "gepera2026";
    const DEFAULT_DATA = window.GEPERA_DEFAULT_DATA || {};
    const pageMap = {
        home: "index.html",
        sobre: "sobre.html",
        objetivos: "objetivos.html",
        pesquisa: "pesquisa.html",
        pesquisadores: "pesquisadores.html",
        acoes: "acoes.html"
    };

    const publicRoot = document.getElementById("site-root");
    const adminRoot = document.getElementById("admin-root");
    const isHttp = location.protocol === "http:" || location.protocol === "https:";
    let siteData = clone(DEFAULT_DATA);
    let adminSection = "identity";
    let dirty = false;

    init().catch((error) => {
        console.error(error);
        const root = publicRoot || adminRoot;
        if (root) {
            root.innerHTML = '<div class="container section"><div class="error">Não foi possível carregar o site. Verifique o console do navegador.</div></div>';
        }
    });

    async function init() {
        siteData = normalizeData(await loadData());
        applyTheme(siteData.theme);

        if (publicRoot) {
            renderPublicSite();
        }

        if (adminRoot) {
            await renderAdmin();
        }
    }

    async function loadData() {
        const local = readLocalData();

        if (isHttp) {
            try {
                const response = await fetch("api/content", { cache: "no-store" });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.settings) {
                        return data;
                    }
                }
            } catch (error) {
                console.warn("Conteúdo do servidor indisponível, usando fallback local.", error);
            }
        }

        return local || clone(DEFAULT_DATA);
    }

    function readLocalData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn("Dados locais inválidos.", error);
            return null;
        }
    }

    async function persistData() {
        const payload = normalizeData(siteData);
        siteData = payload;

        if (isHttp) {
            const response = await fetch("api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Falha ao salvar no servidor.");
            }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return payload;
    }

    function normalizeData(input) {
        const merged = deepMerge(clone(DEFAULT_DATA), clone(input || {}));
        merged.settings = merged.settings || {};
        merged.theme = merged.theme || {};
        merged.pages = merged.pages || {};
        merged.nav = Array.isArray(merged.nav) ? merged.nav : [];
        merged.customPages = Array.isArray(merged.customPages) ? merged.customPages : [];

        Object.entries(pageMap).forEach(([id, href]) => {
            if (!merged.nav.some((item) => item.id === id)) {
                merged.nav.push({ id, label: labelFromId(id), type: "core", href, visible: true });
            }
        });

        syncCustomNav(merged);
        return merged;
    }

    function syncCustomNav(data) {
        data.customPages.forEach((page) => {
            page.slug = sanitizeSlug(page.slug || page.label || page.title || "pagina");
            page.id = page.id || `custom-${page.slug}`;
            page.label = page.label || page.title || "Página";
            page.sections = Array.isArray(page.sections) ? page.sections : [];

            let navItem = data.nav.find((item) => item.id === page.id);
            if (!navItem) {
                navItem = { id: page.id, label: page.label, type: "custom", slug: page.slug, visible: true };
                data.nav.push(navItem);
            }

            navItem.type = "custom";
            navItem.slug = page.slug;
            navItem.label = page.label;
        });
    }

    function deepMerge(base, source) {
        Object.keys(source || {}).forEach((key) => {
            const value = source[key];
            if (Array.isArray(value)) {
                base[key] = value;
            } else if (value && typeof value === "object") {
                base[key] = deepMerge(base[key] && typeof base[key] === "object" && !Array.isArray(base[key]) ? base[key] : {}, value);
            } else {
                base[key] = value;
            }
        });
        return base;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value || {}));
    }

    function labelFromId(id) {
        const labels = {
            home: "Início",
            sobre: "Sobre",
            objetivos: "Objetivos & Metas",
            pesquisa: "Pesquisa",
            pesquisadores: "Pesquisadores",
            acoes: "Ações"
        };
        return labels[id] || id;
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        const safeTheme = theme || {};
        ["primary", "secondary", "accent", "ink", "muted", "paper", "surface", "line", "soft"].forEach((key) => {
            if (safeTheme[key]) {
                root.style.setProperty(`--${key}`, safeTheme[key]);
            }
        });

        document.body.classList.remove("layout-editorial", "layout-revista", "layout-painel");
        document.body.classList.add(`layout-${safeTheme.layout || "editorial"}`);
    }

    function renderPublicSite() {
        publicRoot.textContent = "";
        publicRoot.append(skipLink(), renderHeader(), renderMain(), renderFooter());
        setupPublicInteractions();
        refreshIcons();
    }

    function skipLink() {
        return node("a", { class: "skip-link", href: "#conteudo" }, "Pular para o conteúdo");
    }

    function renderHeader() {
        const header = node("header", { class: "site-header" });
        const inner = node("div", { class: "container header-inner" });
        const brand = node("a", { class: "brand", href: "index.html", "aria-label": "Página inicial do GEPERA" }, [
            renderBrandMark(),
            node("span", { class: "brand-copy" }, [
                node("span", { class: "brand-title" }, siteData.settings.abbreviation || "GEPERA"),
                node("span", { class: "brand-subtitle" }, siteData.settings.siteName || "")
            ])
        ]);

        const nav = node("nav", { class: "site-nav", id: "siteNav", "aria-label": "Navegação principal" });
        visibleNavItems().forEach((item) => {
            const link = node("a", {
                class: `nav-link${isActiveNav(item) ? " active" : ""}`,
                href: hrefForNav(item)
            }, item.label);
            nav.append(link);
        });

        const wrap = node("div", { class: "nav-wrap" }, [
            nav,
            node("a", { class: "admin-entry", href: "admin.html", title: "Admin", "aria-label": "Admin" }, icon("lock-keyhole")),
            node("button", { class: "icon-button nav-toggle", id: "navToggle", type: "button", "aria-label": "Abrir menu" }, icon("menu"))
        ]);

        inner.append(brand, wrap);
        header.append(inner);
        return header;
    }

    function renderBrandMark() {
        const mark = node("span", { class: "brand-mark" });
        if (siteData.settings.logo) {
            mark.append(node("img", { src: siteData.settings.logo, alt: "" }));
        } else {
            mark.textContent = (siteData.settings.abbreviation || "G").slice(0, 1);
        }
        return mark;
    }

    function renderMain() {
        const main = node("main", { id: "conteudo" });
        const page = currentPage();

        if (page.type === "custom") {
            main.append(renderCustomPage(page.data));
            return main;
        }

        if (page.id === "home") renderHome(main);
        if (page.id === "sobre") renderSobre(main);
        if (page.id === "objetivos") renderObjetivos(main);
        if (page.id === "pesquisa") renderPesquisa(main);
        if (page.id === "pesquisadores") renderPesquisadores(main);
        if (page.id === "acoes") renderAcoes(main);

        return main;
    }

    function renderHome(main) {
        const home = siteData.pages.home;
        const hero = node("section", { class: "hero" });
        hero.style.setProperty("--hero-image", `url("${home.heroImage || "religious-symbols-bg.png"}")`);
        hero.append(node("div", { class: "container hero-content" }, [
            node("span", { class: "eyebrow" }, home.eyebrow || ""),
            node("h1", { class: "hero-title" }, home.title || siteData.settings.abbreviation || "GEPERA"),
            node("p", { class: "hero-subtitle" }, home.lead || siteData.settings.tagline || ""),
            node("div", { class: "hero-actions" }, [
                node("a", { class: "button primary", href: "acoes.html" }, [icon("calendar-days"), "Ver ações"]),
                node("a", { class: "button secondary", href: "pesquisa.html" }, [icon("book-open"), "Conhecer pesquisas"])
            ]),
            node("div", { class: "hero-stats" }, (home.stats || []).map((stat) => node("div", { class: "hero-stat" }, [
                node("strong", {}, stat.value || ""),
                node("span", {}, stat.label || "")
            ])))
        ]), { single: true });
        main.append(hero);

        main.append(sectionBlock({
            title: home.introTitle,
            lead: siteData.settings.description,
            children: [
                node("div", { class: "split" }, [
                    textStack(home.intro || []),
                    node("div", { class: "feature-grid" }, (home.highlights || []).map((item) => featureCard(item)))
                ])
            ]
        }));

        const actions = siteData.pages.acoes.actions || [];
        if (actions.length) {
            main.append(sectionBlock({
                className: "alt",
                eyebrow: "Em destaque",
                title: "Ações recentes",
                lead: siteData.pages.acoes.intro,
                children: [renderActionCarousel(actions.slice(0, 6))]
            }));
        }
    }

    function renderSobre(main) {
        const page = siteData.pages.sobre;
        main.append(pageHero(page.eyebrow, page.title, siteData.settings.tagline));
        main.append(sectionBlock({
            children: [
                node("div", { class: "split" }, [
                    textStack(page.paragraphs || []),
                    renderImageCarousel(page.carousel || [])
                ])
            ]
        }));
        main.append(sectionBlock({
            className: "alt",
            eyebrow: "Trajetória",
            title: "Linha do tempo",
            children: [renderTimeline(page.timeline || [])]
        }));
    }

    function renderObjetivos(main) {
        const page = siteData.pages.objetivos;
        main.append(pageHero(page.eyebrow, page.title, "Objetivos, metas e frentes de atuação do grupo."));
        main.append(sectionBlock({
            children: [
                renderTabs([
                    {
                        title: "Objetivo geral",
                        content: node("div", { class: "objective-general" }, node("p", {}, page.general || ""))
                    },
                    {
                        title: "Objetivos específicos",
                        content: node("div", { class: "objective-grid" }, (page.specific || []).map((text, index) => objectiveCard(index + 1, text)))
                    },
                    {
                        title: "Metas",
                        content: node("div", { class: "objective-grid" }, (page.goals || []).map((text, index) => objectiveCard(index + 1, text)))
                    }
                ])
            ]
        }));
    }

    function renderPesquisa(main) {
        const page = siteData.pages.pesquisa;
        main.append(pageHero(page.eyebrow, page.title, "Linhas, temas e descrição da produção acadêmica."));
        main.append(sectionBlock({
            children: [
                node("div", { class: "research-layout" }, [
                    node("div", { class: "research-card-list" }, (page.lines || []).map((line) => researchCard(line))),
                    renderTabs((page.tabs || []).map((tab) => ({
                        title: tab.title,
                        content: node("div", { class: "research-copy" }, node("p", {}, tab.body || ""))
                    })))
                ])
            ]
        }));
    }

    function renderPesquisadores(main) {
        const page = siteData.pages.pesquisadores;
        main.append(pageHero(page.eyebrow, page.title, page.subtitle));
        main.append(sectionBlock({
            children: [
                node("div", { class: "researchers-grid" }, (page.researchers || []).map((researcher) => researcherCard(researcher)))
            ]
        }));
    }

    function renderAcoes(main) {
        const page = siteData.pages.acoes;
        main.append(pageHero(page.eyebrow, page.title, page.intro));
        main.append(sectionBlock({
            children: [
                renderActionFilters(page.actions || []),
                node("div", { class: "actions-grid", id: "actionsGrid" }, (page.actions || []).map((action) => actionCard(action)))
            ]
        }));

        main.append(sectionBlock({
            className: "alt",
            eyebrow: "Acervo",
            title: "Publicações",
            lead: "Artigos, livros, capítulos e materiais publicados pelo grupo.",
            children: [renderPublications(page.publications || [])]
        }));
    }

    function renderCustomPage(page) {
        const fragment = document.createDocumentFragment();
        fragment.append(pageHero(page.eyebrow, page.title, page.intro));
        const layout = page.layout || "editorial";
        fragment.append(sectionBlock({
            children: [
                node("div", { class: `custom-layout ${layout}` }, (page.sections || []).map((section) => customSection(section)))
            ]
        }));
        return fragment;
    }

    function pageHero(eyebrow, title, lead) {
        return node("section", { class: "page-hero" }, node("div", { class: "container section-header" }, [
            node("span", { class: "eyebrow" }, eyebrow || ""),
            node("h1", { class: "section-title" }, title || ""),
            lead ? node("p", { class: "section-lead" }, lead) : null
        ]));
    }

    function sectionBlock({ eyebrow, title, lead, children, className } = {}) {
        const section = node("section", { class: `section${className ? ` ${className}` : ""}` });
        const container = node("div", { class: "container" });
        if (eyebrow || title || lead) {
            container.append(sectionHeader(eyebrow, title, lead));
        }
        (children || []).forEach((child) => container.append(child));
        section.append(container);
        return section;
    }

    function sectionHeader(eyebrow, title, lead) {
        return node("div", { class: "section-header" }, [
            eyebrow ? node("span", { class: "eyebrow" }, eyebrow) : null,
            title ? node("h2", { class: "section-title" }, title) : null,
            lead ? node("p", { class: "section-lead" }, lead) : null
        ]);
    }

    function textStack(paragraphs) {
        return node("div", { class: "text-stack" }, (paragraphs || []).map((text) => node("p", {}, text)));
    }

    function featureCard(item) {
        return node("article", { class: "feature-card" }, [
            node("span", { class: "icon" }, icon(item.icon || "sparkles")),
            node("h3", {}, item.title || ""),
            node("p", {}, item.body || "")
        ]);
    }

    function objectiveCard(number, text) {
        return node("article", { class: "objective-card" }, [
            node("span", { class: "tag" }, `#${number}`),
            node("p", {}, text || "")
        ]);
    }

    function researchCard(item) {
        return node("article", { class: "research-card" }, [
            node("span", { class: "icon" }, icon(item.icon || "book-open")),
            node("h3", {}, item.title || ""),
            node("p", {}, item.body || "")
        ]);
    }

    function researcherCard(researcher) {
        const initials = (researcher.name || "G").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
        const photo = node("div", { class: "researcher-photo" });
        if (researcher.photo) {
            photo.append(node("img", { src: researcher.photo, alt: researcher.name || "" }));
        } else {
            photo.textContent = initials;
        }

        const links = [];
        if (researcher.lattes) links.push(node("a", { class: "text-link", href: researcher.lattes, target: "_blank", rel: "noopener" }, [icon("external-link"), "Lattes"]));
        if (researcher.email) links.push(node("a", { class: "text-link", href: `mailto:${researcher.email}` }, [icon("mail"), "E-mail"]));

        return node("article", { class: "researcher-card" }, [
            photo,
            node("div", { class: "researcher-info" }, [
                node("span", { class: "researcher-role" }, researcher.role || "Pesquisador"),
                node("h3", {}, researcher.name || ""),
                researcher.area ? node("div", { class: "researcher-area" }, researcher.area) : null,
                node("p", {}, researcher.bio || ""),
                links.length ? node("div", { class: "link-list" }, links) : null
            ])
        ]);
    }

    function renderImageCarousel(items) {
        if (!items.length) {
            return node("div", { class: "media-frame" }, node("div", { class: "media-placeholder" }, "GEPERA"));
        }
        return renderSwiper(items, (item) => node("article", { class: "slide-card" }, [
            renderSlideImage(item.image, item.title),
            node("div", { class: "slide-copy" }, [
                node("h3", {}, item.title || ""),
                node("p", {}, item.caption || "")
            ])
        ]));
    }

    function renderActionCarousel(items) {
        return renderSwiper(items, (item) => actionCard(item, true));
    }

    function renderSwiper(items, slideRenderer, options = {}) {
        const carousel = node("div", { class: "site-carousel swiper js-swiper", "data-single": options.single ? "true" : "false" });
        const wrapper = node("div", { class: "swiper-wrapper" });
        items.forEach((item) => wrapper.append(node("div", { class: "swiper-slide" }, slideRenderer(item))));
        carousel.append(wrapper);
        carousel.append(node("div", { class: "carousel-controls" }, [
            node("button", { class: "icon-button js-prev", type: "button", "aria-label": "Anterior" }, icon("chevron-left")),
            node("button", { class: "icon-button js-next", type: "button", "aria-label": "Próximo" }, icon("chevron-right"))
        ]));
        return carousel;
    }

    function renderSlideImage(src, alt) {
        const frame = node("div", { class: "slide-image" });
        if (src) {
            frame.append(node("img", { src, alt: alt || "" }));
        }
        return frame;
    }

    function renderTimeline(items) {
        return node("div", { class: "timeline" }, items.map((item) => node("article", { class: "timeline-item" }, [
            node("div", { class: "timeline-year" }, item.year || ""),
            node("div", {}, [
                node("h3", {}, item.title || ""),
                node("p", {}, item.body || "")
            ])
        ])));
    }

    function renderTabs(tabs) {
        const id = `tabs-${Math.random().toString(36).slice(2)}`;
        return node("div", { class: "js-tabs" }, [
            node("div", { class: "tabs", role: "tablist" }, tabs.map((tab, index) => node("button", {
                class: `tab-button${index === 0 ? " active" : ""}`,
                type: "button",
                role: "tab",
                "data-tab-target": `${id}-${index}`
            }, tab.title || `Aba ${index + 1}`))),
            ...tabs.map((tab, index) => node("div", {
                class: `tab-panel${index === 0 ? " active" : ""}`,
                id: `${id}-${index}`,
                role: "tabpanel"
            }, tab.content))
        ]);
    }

    function renderActionFilters(actions) {
        const categories = ["Todas", ...Array.from(new Set(actions.map((action) => action.category).filter(Boolean)))];
        return node("div", { class: "actions-toolbar" }, [
            node("div", { class: "tabs", id: "actionFilters" }, categories.map((category, index) => node("button", {
                class: `tab-button filter-button${index === 0 ? " active" : ""}`,
                type: "button",
                "data-filter": category
            }, category))),
            node("span", { class: "status-pill" }, `${actions.length} ações cadastradas`)
        ]);
    }

    function actionCard(action, compact = false) {
        const media = compact ? renderActionStaticMedia(action) : renderActionGallery(action);
        const card = node("article", { class: "action-card", "data-category": action.category || "" }, [
            media,
            node("div", { class: "action-body" }, [
                node("div", { class: "meta-row" }, [
                    action.category ? node("span", { class: "tag" }, action.category) : null,
                    action.date ? node("span", { class: "tag" }, action.date) : null
                ]),
                node("h3", {}, action.title || ""),
                node("p", {}, action.description || ""),
                action.link ? node("div", { class: "link-list" }, node("a", { class: "text-link", href: action.link, target: "_blank", rel: "noopener" }, [icon("external-link"), "Abrir"])) : null
            ])
        ]);
        return card;
    }

    function renderActionStaticMedia(action) {
        const firstImage = Array.isArray(action.images) && action.images[0] ? action.images[0].image : "";
        const media = node("div", { class: "action-media" });
        if (firstImage) {
            media.append(node("img", { src: firstImage, alt: action.title || "" }));
        }
        return media;
    }

    function renderActionGallery(action) {
        const images = (Array.isArray(action.images) ? action.images : []).filter((item) => item && item.image);
        if (images.length <= 1) {
            return renderActionStaticMedia(action);
        }

        const gallery = node("div", { class: "action-media action-gallery swiper js-media-swiper" });
        const wrapper = node("div", { class: "swiper-wrapper" });
        images.forEach((item) => {
            wrapper.append(node("div", { class: "swiper-slide" }, node("img", {
                src: item.image,
                alt: item.caption || action.title || ""
            })));
        });
        gallery.append(wrapper, node("div", { class: "swiper-pagination" }));
        return gallery;
    }

    function renderPublications(publications) {
        if (!publications.length) {
            return node("div", { class: "empty-state" }, "Acervo de publicações em atualização.");
        }
        return node("div", { class: "publications-grid" }, publications.map((publication) => publicationCard(publication)));
    }

    function publicationCard(publication) {
        const cover = node("div", { class: "publication-cover" });
        if (publication.cover) {
            cover.append(node("img", { src: publication.cover, alt: publication.title || "" }));
        } else {
            cover.textContent = publication.type || "Publicação";
        }

        return node("article", { class: "publication-card" }, [
            cover,
            node("div", { class: "publication-body" }, [
                node("div", { class: "meta-row" }, [
                    publication.type ? node("span", { class: "tag" }, publication.type) : null,
                    publication.year ? node("span", { class: "tag" }, publication.year) : null
                ]),
                node("h3", {}, publication.title || ""),
                publication.authors ? node("p", {}, publication.authors) : null,
                publication.venue ? node("p", {}, publication.venue) : null,
                publication.summary ? node("p", {}, publication.summary) : null,
                publication.link ? node("div", { class: "link-list" }, node("a", { class: "text-link", href: publication.link, target: "_blank", rel: "noopener" }, [icon("external-link"), "Acessar"])) : null
            ])
        ]);
    }

    function customSection(section) {
        const hasImage = Boolean(section.image);
        const imageFrame = node("div", { class: "custom-image" });
        if (hasImage) {
            imageFrame.append(node("img", { src: section.image, alt: section.title || "" }));
        }
        return node("article", { class: "custom-section" }, [
            imageFrame,
            node("div", { class: "custom-copy" }, [
                node("h3", {}, section.title || ""),
                ...textToParagraphs(section.body || "").map((text) => node("p", {}, text))
            ])
        ]);
    }

    function renderFooter() {
        const footer = node("footer", { class: "site-footer" });
        const visible = visibleNavItems();
        footer.append(node("div", { class: "container" }, [
            node("div", { class: "footer-grid" }, [
                node("div", {}, [
                    node("div", { class: "brand" }, [renderBrandMark(), node("span", { class: "brand-copy" }, [
                        node("span", { class: "brand-title" }, siteData.settings.abbreviation || "GEPERA"),
                        node("span", { class: "brand-subtitle" }, siteData.settings.footerText || "")
                    ])]),
                    node("p", {}, siteData.settings.description || "")
                ]),
                node("div", {}, [
                    node("h2", { class: "footer-title" }, "Navegação"),
                    node("ul", { class: "footer-list" }, visible.map((item) => node("li", {}, node("a", { href: hrefForNav(item) }, item.label))))
                ]),
                node("div", {}, [
                    node("h2", { class: "footer-title" }, "Contato"),
                    node("ul", { class: "footer-list" }, (siteData.settings.contactLines || []).map((line) => node("li", {}, line)))
                ])
            ]),
            node("div", { class: "footer-bottom" }, `© ${siteData.settings.year || new Date().getFullYear()} ${siteData.settings.abbreviation || "GEPERA"} - Todos os direitos reservados.`)
        ]));
        return footer;
    }

    function visibleNavItems() {
        return (siteData.nav || []).filter((item) => item.visible !== false);
    }

    function currentPage() {
        const bodyPage = document.body.dataset.page || "home";
        if (bodyPage === "custom") {
            const slug = new URLSearchParams(location.search).get("page");
            const custom = siteData.customPages.find((page) => page.slug === slug) || siteData.customPages[0];
            return { type: "custom", id: custom ? custom.id : "custom", data: custom || emptyCustomPage() };
        }
        return { type: "core", id: bodyPage };
    }

    function isActiveNav(item) {
        const page = currentPage();
        if (page.type === "custom") return item.type === "custom" && item.slug === page.data.slug;
        return item.id === page.id;
    }

    function hrefForNav(item) {
        if (item.type === "custom") {
            return `pagina.html?page=${encodeURIComponent(item.slug || "")}`;
        }
        return item.href || pageMap[item.id] || "index.html";
    }

    function setupPublicInteractions() {
        const toggle = document.getElementById("navToggle");
        const nav = document.getElementById("siteNav");
        if (toggle && nav) {
            toggle.addEventListener("click", () => nav.classList.toggle("open"));
        }

        document.querySelectorAll(".js-tabs").forEach((tabsRoot) => {
            tabsRoot.addEventListener("click", (event) => {
                const button = event.target.closest("[data-tab-target]");
                if (!button) return;
                const target = button.dataset.tabTarget;
                tabsRoot.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
                tabsRoot.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                const panel = tabsRoot.querySelector(`#${CSS.escape(target)}`);
                if (panel) panel.classList.add("active");
            });
        });

        const filters = document.getElementById("actionFilters");
        if (filters) {
            filters.addEventListener("click", (event) => {
                const button = event.target.closest("[data-filter]");
                if (!button) return;
                const filter = button.dataset.filter;
                filters.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
                button.classList.add("active");
                document.querySelectorAll(".action-card[data-category]").forEach((card) => {
                    card.hidden = filter !== "Todas" && card.dataset.category !== filter;
                });
            });
        }

        if (window.Swiper) {
            document.querySelectorAll(".js-swiper").forEach((carousel) => {
                if (carousel.swiper) return;
                const single = carousel.dataset.single === "true";
                new window.Swiper(carousel, {
                    slidesPerView: 1,
                    spaceBetween: 18,
                    loop: carousel.querySelectorAll(".swiper-slide").length > 2,
                    navigation: {
                        nextEl: carousel.querySelector(".js-next"),
                        prevEl: carousel.querySelector(".js-prev")
                    },
                    breakpoints: single ? undefined : {
                        720: { slidesPerView: 2 },
                        1080: { slidesPerView: 3 }
                    }
                });
            });

            document.querySelectorAll(".js-media-swiper").forEach((carousel) => {
                if (carousel.swiper) return;
                new window.Swiper(carousel, {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    loop: carousel.querySelectorAll(".swiper-slide").length > 1,
                    autoplay: {
                        delay: 2600,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: carousel.querySelector(".swiper-pagination"),
                        clickable: true
                    }
                });
            });
        }
    }

    async function renderAdmin() {
        applyTheme(siteData.theme);
        if (!(await isLoggedIn())) {
            renderLogin();
            return;
        }
        renderAdminShell();
    }

    async function isLoggedIn() {
        if (sessionStorage.getItem("gepera.admin") === "1") return true;
        if (!isHttp) return false;
        try {
            const response = await fetch("api/session", { credentials: "same-origin", cache: "no-store" });
            return response.ok;
        } catch {
            return false;
        }
    }

    function renderLogin(message) {
        adminRoot.innerHTML = `
            <div class="admin-login">
                <form class="login-card" id="loginForm">
                    <span class="brand-mark">G</span>
                    <h1>Acesso admin</h1>
                    <p>Entre para editar conteúdo, páginas, cores e publicações.</p>
                    ${message ? `<div class="error">${escapeHtml(message)}</div>` : ""}
                    <div class="form-grid one">
                        ${fieldHtml("Usuário", "login-user", "text", FALLBACK_USER, { plainId: "loginUser", noPath: true })}
                        ${fieldHtml("Senha", "login-pass", "password", "", { plainId: "loginPass", noPath: true })}
                    </div>
                    <div class="admin-actions" style="margin-top:18px;">
                        <button class="button primary" type="submit"><i data-lucide="log-in"></i> Entrar</button>
                        <a class="button secondary" href="index.html" style="color:var(--ink);border-color:var(--line);"><i data-lucide="arrow-left"></i> Voltar</a>
                    </div>
                </form>
            </div>
        `;
        refreshIcons();
        document.getElementById("loginForm").addEventListener("submit", handleLogin);
    }

    async function handleLogin(event) {
        event.preventDefault();
        const user = document.getElementById("loginUser").value.trim();
        const password = document.getElementById("loginPass").value;

        if (isHttp) {
            try {
                const response = await fetch("api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({ user, password })
                });

                if (response.ok) {
                    sessionStorage.setItem("gepera.admin", "1");
                    renderAdminShell();
                    return;
                }

                renderLogin("Usuário ou senha inválidos.");
                return;
            } catch {
                renderLogin("Servidor indisponível para autenticação.");
                return;
            }
        }

        if (user === FALLBACK_USER && password === FALLBACK_PASS) {
            sessionStorage.setItem("gepera.admin", "1");
            renderAdminShell();
        } else {
            renderLogin("Usuário ou senha inválidos.");
        }
    }

    function renderAdminShell() {
        siteData = normalizeData(siteData);
        applyTheme(siteData.theme);
        adminRoot.innerHTML = `
            <div class="admin-shell">
                <aside class="admin-sidebar">
                    <div class="brand">
                        <span class="brand-mark">${escapeHtml((siteData.settings.abbreviation || "G").slice(0, 1))}</span>
                        <span class="brand-copy">
                            <span class="brand-title">${escapeHtml(siteData.settings.abbreviation || "GEPERA")}</span>
                            <span class="brand-subtitle">Painel administrativo</span>
                        </span>
                    </div>
                    <nav class="admin-menu" id="adminMenu">
                        ${adminMenuItems().map((item) => `
                            <button type="button" data-section="${item.id}" class="${adminSection === item.id ? "active" : ""}">
                                <i data-lucide="${item.icon}"></i>${item.label}
                            </button>
                        `).join("")}
                    </nav>
                </aside>
                <main class="admin-main">
                    <div class="admin-topbar">
                        <div class="admin-title">
                            <h1>${escapeHtml(activeMenuItem().label)}</h1>
                            <p>${escapeHtml(activeMenuItem().subtitle)}</p>
                        </div>
                        <div class="admin-actions">
                            <span class="status-pill ${dirty ? "dirty" : "saved"}" id="saveStatus">${dirty ? "Alterações pendentes" : "Tudo salvo"}</span>
                            <button class="small-button" type="button" data-admin-action="save"><i data-lucide="save"></i> Salvar</button>
                            <a class="small-button" href="index.html"><i data-lucide="external-link"></i> Ver site</a>
                            <button class="small-button" type="button" data-admin-action="logout"><i data-lucide="log-out"></i> Sair</button>
                        </div>
                    </div>
                    <div class="admin-panel" id="adminPanel"></div>
                </main>
            </div>
        `;

        document.getElementById("adminMenu").addEventListener("click", (event) => {
            const button = event.target.closest("[data-section]");
            if (!button) return;
            adminSection = button.dataset.section;
            renderAdminShell();
        });

        document.querySelector(".admin-main").addEventListener("click", handleAdminAction);
        renderAdminPanel();
        refreshIcons();
    }

    function adminMenuItems() {
        return [
            { id: "identity", label: "Identidade", subtitle: "Nome, descrição, contatos e redes.", icon: "badge" },
            { id: "pages", label: "Páginas", subtitle: "Menus, abas novas e páginas personalizadas.", icon: "layout-dashboard" },
            { id: "about", label: "Sobre", subtitle: "Textos, carrossel e linha do tempo.", icon: "info" },
            { id: "goals", label: "Objetivos", subtitle: "Objetivo geral, específicos e metas.", icon: "target" },
            { id: "research", label: "Pesquisa", subtitle: "Linhas, abas e descrições acadêmicas.", icon: "microscope" },
            { id: "people", label: "Pesquisadores", subtitle: "Equipe, bios, fotos e Lattes.", icon: "users" },
            { id: "actions", label: "Ações", subtitle: "Eventos, categorias e imagens.", icon: "calendar-days" },
            { id: "publications", label: "Publicações", subtitle: "Artigos, livros e capítulos.", icon: "library" },
            { id: "theme", label: "Aparência", subtitle: "Cores e layout geral do site.", icon: "palette" },
            { id: "backup", label: "Backup", subtitle: "Exportar, importar e restaurar dados.", icon: "database" }
        ];
    }

    function activeMenuItem() {
        return adminMenuItems().find((item) => item.id === adminSection) || adminMenuItems()[0];
    }

    function renderAdminPanel() {
        const panel = document.getElementById("adminPanel");
        if (!panel) return;

        const html = {
            identity: panelIdentity,
            pages: panelPages,
            about: panelAbout,
            goals: panelGoals,
            research: panelResearch,
            people: panelPeople,
            actions: panelActions,
            publications: panelPublications,
            theme: panelTheme,
            backup: panelBackup
        }[adminSection]();

        panel.innerHTML = html;
        panel.oninput = handleAdminInput;
        panel.onchange = handleAdminInput;
        refreshIcons();
    }

    function panelIdentity() {
        const settings = siteData.settings;
        return `
            <section class="admin-card">
                <h2>Identidade do site</h2>
                <div class="form-grid">
                    ${fieldHtml("Sigla", "settings.abbreviation", "text", settings.abbreviation)}
                    ${fieldHtml("Nome completo", "settings.siteName", "text", settings.siteName)}
                    ${fieldHtml("Chamada curta", "settings.tagline", "text", settings.tagline)}
                    ${fieldHtml("Ano do rodapé", "settings.year", "text", settings.year)}
                    ${fieldHtml("Instituição", "settings.institution", "text", settings.institution)}
                    ${fieldHtml("Programa/curso", "settings.program", "text", settings.program)}
                    ${fieldHtml("Cidade", "settings.city", "text", settings.city)}
                    ${imageFieldHtml("Logo", "settings.logo", settings.logo)}
                </div>
                <div class="form-grid one" style="margin-top:14px;">
                    ${fieldHtml("Descrição institucional", "settings.description", "textarea", settings.description)}
                    ${fieldHtml("Contato", "settings.contactLines", "textarea", (settings.contactLines || []).join("\n"), { lines: true })}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Links institucionais</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="settings.socialLinks" data-template="social"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                <div class="admin-list">
                    ${(settings.socialLinks || []).map((link, index) => listItem(`Link ${index + 1}`, "settings.socialLinks", index, `
                        <div class="form-grid">
                            ${fieldHtml("Rótulo", `settings.socialLinks.${index}.label`, "text", link.label)}
                            ${fieldHtml("URL", `settings.socialLinks.${index}.url`, "url", link.url)}
                        </div>
                    `)).join("")}
                </div>
            </section>
            <section class="admin-card">
                <h2>Página inicial</h2>
                <div class="form-grid">
                    ${fieldHtml("Selo", "pages.home.eyebrow", "text", siteData.pages.home.eyebrow)}
                    ${fieldHtml("Título principal", "pages.home.title", "text", siteData.pages.home.title)}
                    ${imageFieldHtml("Imagem de fundo", "pages.home.heroImage", siteData.pages.home.heroImage)}
                </div>
                <div class="form-grid one" style="margin-top:14px;">
                    ${fieldHtml("Texto de destaque", "pages.home.lead", "textarea", siteData.pages.home.lead)}
                    ${fieldHtml("Introdução", "pages.home.intro", "textarea", (siteData.pages.home.intro || []).join("\n\n"), { paragraphs: true })}
                </div>
            </section>
        `;
    }

    function panelPages() {
        return `
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Menu do site</h2>
                    <button class="small-button" type="button" data-admin-action="add-custom-page"><i data-lucide="plus"></i> Nova aba</button>
                </div>
                <div class="admin-list">
                    ${(siteData.nav || []).map((item, index) => listItem(`${item.label || "Página"} ${item.type === "custom" ? "· personalizada" : ""}`, "nav", index, `
                        <div class="form-grid">
                            ${fieldHtml("Nome no menu", `nav.${index}.label`, "text", item.label)}
                            <label class="checkbox-field"><input type="checkbox" data-path="nav.${index}.visible" ${item.visible !== false ? "checked" : ""}> Visível no menu</label>
                        </div>
                    `, { canDelete: item.type === "custom" })).join("")}
                </div>
            </section>
            <section class="admin-card">
                <h2>Páginas personalizadas</h2>
                <div class="admin-list">
                    ${(siteData.customPages || []).map((page, index) => customPageEditor(page, index)).join("")}
                </div>
            </section>
        `;
    }

    function customPageEditor(page, index) {
        return listItem(page.title || "Página personalizada", "customPages", index, `
            <div class="form-grid">
                ${fieldHtml("Nome no menu", `customPages.${index}.label`, "text", page.label)}
                ${fieldHtml("Slug", `customPages.${index}.slug`, "text", page.slug)}
                ${fieldHtml("Selo", `customPages.${index}.eyebrow`, "text", page.eyebrow)}
                ${selectHtml("Layout da página", `customPages.${index}.layout`, page.layout, [
                    ["editorial", "Editorial"],
                    ["grid", "Grade"],
                    ["timeline", "Linha do tempo"]
                ])}
            </div>
            <div class="form-grid one" style="margin-top:14px;">
                ${fieldHtml("Título", `customPages.${index}.title`, "text", page.title)}
                ${fieldHtml("Introdução", `customPages.${index}.intro`, "textarea", page.intro)}
            </div>
            <div class="list-item-header" style="margin-top:18px;">
                <h3>Seções</h3>
                <button class="small-button" type="button" data-admin-action="add" data-path="customPages.${index}.sections" data-template="customSection"><i data-lucide="plus"></i> Adicionar seção</button>
            </div>
            <div class="admin-list">
                ${(page.sections || []).map((section, sectionIndex) => listItem(section.title || `Seção ${sectionIndex + 1}`, `customPages.${index}.sections`, sectionIndex, `
                    <div class="form-grid">
                        ${fieldHtml("Título", `customPages.${index}.sections.${sectionIndex}.title`, "text", section.title)}
                        ${imageFieldHtml("Imagem", `customPages.${index}.sections.${sectionIndex}.image`, section.image)}
                    </div>
                    <div class="form-grid one" style="margin-top:14px;">
                        ${fieldHtml("Texto", `customPages.${index}.sections.${sectionIndex}.body`, "textarea", section.body)}
                    </div>
                `)).join("")}
            </div>
        `, { canDelete: true });
    }

    function panelAbout() {
        const page = siteData.pages.sobre;
        return `
            <section class="admin-card">
                <h2>Conteúdo da página Sobre</h2>
                <div class="form-grid">
                    ${fieldHtml("Selo", "pages.sobre.eyebrow", "text", page.eyebrow)}
                    ${fieldHtml("Título", "pages.sobre.title", "text", page.title)}
                </div>
                <div class="form-grid one" style="margin-top:14px;">
                    ${fieldHtml("Parágrafos", "pages.sobre.paragraphs", "textarea", (page.paragraphs || []).join("\n\n"), { paragraphs: true })}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Carrossel</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.sobre.carousel" data-template="carousel"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                <div class="admin-list">
                    ${(page.carousel || []).map((item, index) => listItem(item.title || `Slide ${index + 1}`, "pages.sobre.carousel", index, `
                        <div class="form-grid">
                            ${fieldHtml("Título", `pages.sobre.carousel.${index}.title`, "text", item.title)}
                            ${imageFieldHtml("Imagem", `pages.sobre.carousel.${index}.image`, item.image)}
                        </div>
                        <div class="form-grid one" style="margin-top:14px;">
                            ${fieldHtml("Legenda", `pages.sobre.carousel.${index}.caption`, "textarea", item.caption)}
                        </div>
                    `)).join("")}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Linha do tempo</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.sobre.timeline" data-template="timeline"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                <div class="admin-list">
                    ${(page.timeline || []).map((item, index) => listItem(`${item.year || ""} ${item.title || ""}`, "pages.sobre.timeline", index, `
                        <div class="form-grid">
                            ${fieldHtml("Ano", `pages.sobre.timeline.${index}.year`, "text", item.year)}
                            ${fieldHtml("Título", `pages.sobre.timeline.${index}.title`, "text", item.title)}
                        </div>
                        <div class="form-grid one" style="margin-top:14px;">
                            ${fieldHtml("Texto", `pages.sobre.timeline.${index}.body`, "textarea", item.body)}
                        </div>
                    `)).join("")}
                </div>
            </section>
        `;
    }

    function panelGoals() {
        const page = siteData.pages.objetivos;
        return `
            <section class="admin-card">
                <h2>Objetivo geral</h2>
                ${fieldHtml("Texto", "pages.objetivos.general", "textarea", page.general)}
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Objetivos específicos</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.objetivos.specific" data-template="text"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                ${textArrayEditor("pages.objetivos.specific", page.specific || [])}
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Metas</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.objetivos.goals" data-template="text"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                ${textArrayEditor("pages.objetivos.goals", page.goals || [])}
            </section>
        `;
    }

    function panelResearch() {
        const page = siteData.pages.pesquisa;
        return `
            <section class="admin-card">
                <h2>Cabeçalho</h2>
                <div class="form-grid">
                    ${fieldHtml("Selo", "pages.pesquisa.eyebrow", "text", page.eyebrow)}
                    ${fieldHtml("Título", "pages.pesquisa.title", "text", page.title)}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Abas da pesquisa</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.pesquisa.tabs" data-template="researchTab"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                <div class="admin-list">
                    ${(page.tabs || []).map((tab, index) => listItem(tab.title || `Aba ${index + 1}`, "pages.pesquisa.tabs", index, `
                        <div class="form-grid one">
                            ${fieldHtml("Título da aba", `pages.pesquisa.tabs.${index}.title`, "text", tab.title)}
                            ${fieldHtml("Texto", `pages.pesquisa.tabs.${index}.body`, "textarea", tab.body)}
                        </div>
                    `)).join("")}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Linhas de pesquisa</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.pesquisa.lines" data-template="researchLine"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                <div class="admin-list">
                    ${(page.lines || []).map((line, index) => listItem(line.title || `Linha ${index + 1}`, "pages.pesquisa.lines", index, `
                        <div class="form-grid">
                            ${fieldHtml("Ícone Lucide", `pages.pesquisa.lines.${index}.icon`, "text", line.icon)}
                            ${fieldHtml("Título", `pages.pesquisa.lines.${index}.title`, "text", line.title)}
                        </div>
                        <div class="form-grid one" style="margin-top:14px;">
                            ${fieldHtml("Texto", `pages.pesquisa.lines.${index}.body`, "textarea", line.body)}
                        </div>
                    `)).join("")}
                </div>
            </section>
        `;
    }

    function panelPeople() {
        const page = siteData.pages.pesquisadores;
        return `
            <section class="admin-card">
                <div class="form-grid">
                    ${fieldHtml("Selo", "pages.pesquisadores.eyebrow", "text", page.eyebrow)}
                    ${fieldHtml("Título", "pages.pesquisadores.title", "text", page.title)}
                    ${fieldHtml("Subtítulo", "pages.pesquisadores.subtitle", "text", page.subtitle)}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Pesquisadores</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.pesquisadores.researchers" data-template="researcher"><i data-lucide="plus"></i> Adicionar</button>
                </div>
                <div class="admin-list">
                    ${(page.researchers || []).map((person, index) => listItem(person.name || `Pesquisador ${index + 1}`, "pages.pesquisadores.researchers", index, `
                        <div class="form-grid">
                            ${fieldHtml("Nome", `pages.pesquisadores.researchers.${index}.name`, "text", person.name)}
                            ${fieldHtml("Função", `pages.pesquisadores.researchers.${index}.role`, "text", person.role)}
                            ${fieldHtml("Área", `pages.pesquisadores.researchers.${index}.area`, "text", person.area)}
                            ${imageFieldHtml("Foto", `pages.pesquisadores.researchers.${index}.photo`, person.photo)}
                            ${fieldHtml("Lattes", `pages.pesquisadores.researchers.${index}.lattes`, "url", person.lattes)}
                            ${fieldHtml("E-mail", `pages.pesquisadores.researchers.${index}.email`, "email", person.email)}
                        </div>
                        <div class="form-grid one" style="margin-top:14px;">
                            ${fieldHtml("Biografia", `pages.pesquisadores.researchers.${index}.bio`, "textarea", person.bio)}
                        </div>
                    `)).join("")}
                </div>
            </section>
        `;
    }

    function panelActions() {
        const page = siteData.pages.acoes;
        return `
            <section class="admin-card">
                <h2>Cabeçalho</h2>
                <div class="form-grid">
                    ${fieldHtml("Selo", "pages.acoes.eyebrow", "text", page.eyebrow)}
                    ${fieldHtml("Título", "pages.acoes.title", "text", page.title)}
                </div>
                <div class="form-grid one" style="margin-top:14px;">
                    ${fieldHtml("Introdução", "pages.acoes.intro", "textarea", page.intro)}
                </div>
            </section>
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Ações cadastradas</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.acoes.actions" data-template="action"><i data-lucide="plus"></i> Adicionar ação</button>
                </div>
                <div class="admin-list">
                    ${(page.actions || []).map((action, index) => listItem(action.title || `Ação ${index + 1}`, "pages.acoes.actions", index, `
                        <div class="form-grid">
                            ${fieldHtml("Título", `pages.acoes.actions.${index}.title`, "text", action.title)}
                            ${fieldHtml("Categoria", `pages.acoes.actions.${index}.category`, "text", action.category)}
                            ${fieldHtml("Data/ano", `pages.acoes.actions.${index}.date`, "text", action.date)}
                            ${fieldHtml("Local", `pages.acoes.actions.${index}.location`, "text", action.location)}
                            ${fieldHtml("Link", `pages.acoes.actions.${index}.link`, "url", action.link)}
                        </div>
                        <div class="form-grid one" style="margin-top:14px;">
                            ${fieldHtml("Descrição", `pages.acoes.actions.${index}.description`, "textarea", action.description)}
                            ${fieldHtml("Imagens do carrossel", `pages.acoes.actions.${index}.images`, "textarea", imageListValue(action.images || []), { imageList: true })}
                        </div>
                    `)).join("")}
                </div>
            </section>
        `;
    }

    function panelPublications() {
        const publications = siteData.pages.acoes.publications || [];
        return `
            <section class="admin-card">
                <div class="list-item-header">
                    <h2>Publicações</h2>
                    <button class="small-button" type="button" data-admin-action="add" data-path="pages.acoes.publications" data-template="publication"><i data-lucide="plus"></i> Adicionar publicação</button>
                </div>
                <div class="admin-list">
                    ${publications.map((publication, index) => listItem(publication.title || `Publicação ${index + 1}`, "pages.acoes.publications", index, `
                        <div class="form-grid">
                            ${fieldHtml("Título", `pages.acoes.publications.${index}.title`, "text", publication.title)}
                            ${selectHtml("Tipo", `pages.acoes.publications.${index}.type`, publication.type, [
                                ["Artigo", "Artigo"],
                                ["Livro", "Livro"],
                                ["Capítulo", "Capítulo"],
                                ["Material", "Material"],
                                ["Anais", "Anais"]
                            ])}
                            ${fieldHtml("Autores", `pages.acoes.publications.${index}.authors`, "text", publication.authors)}
                            ${fieldHtml("Ano", `pages.acoes.publications.${index}.year`, "text", publication.year)}
                            ${fieldHtml("Periódico/editora/evento", `pages.acoes.publications.${index}.venue`, "text", publication.venue)}
                            ${fieldHtml("Link", `pages.acoes.publications.${index}.link`, "url", publication.link)}
                            ${imageFieldHtml("Capa", `pages.acoes.publications.${index}.cover`, publication.cover)}
                        </div>
                        <div class="form-grid one" style="margin-top:14px;">
                            ${fieldHtml("Resumo", `pages.acoes.publications.${index}.summary`, "textarea", publication.summary)}
                        </div>
                    `)).join("") || '<div class="notice">Nenhuma publicação cadastrada ainda.</div>'}
                </div>
            </section>
        `;
    }

    function panelTheme() {
        const theme = siteData.theme;
        return `
            <section class="admin-card">
                <h2>Cores e layout</h2>
                <div class="form-grid">
                    ${fieldHtml("Verde principal", "theme.primary", "color", theme.primary)}
                    ${fieldHtml("Verde secundário", "theme.secondary", "color", theme.secondary)}
                    ${fieldHtml("Dourado/acento", "theme.accent", "color", theme.accent)}
                    ${fieldHtml("Texto", "theme.ink", "color", theme.ink)}
                    ${fieldHtml("Texto secundário", "theme.muted", "color", theme.muted)}
                    ${fieldHtml("Fundo", "theme.paper", "color", theme.paper)}
                    ${fieldHtml("Superfície", "theme.surface", "color", theme.surface)}
                    ${selectHtml("Layout geral", "theme.layout", theme.layout, [
                        ["editorial", "Editorial"],
                        ["revista", "Revista acadêmica"],
                        ["painel", "Painel amplo"]
                    ])}
                </div>
            </section>
        `;
    }

    function panelBackup() {
        return `
            <section class="admin-card">
                <h2>Exportar dados</h2>
                <textarea class="backup-box" readonly>${escapeHtml(JSON.stringify(siteData, null, 2))}</textarea>
                <div class="admin-actions" style="margin-top:14px;">
                    <button class="small-button" type="button" data-admin-action="download-json"><i data-lucide="download"></i> Baixar JSON</button>
                </div>
            </section>
            <section class="admin-card">
                <h2>Importar dados</h2>
                <textarea class="backup-box" id="importJson" placeholder="Cole aqui um JSON exportado do painel"></textarea>
                <div class="admin-actions" style="margin-top:14px;">
                    <button class="small-button" type="button" data-admin-action="import-json"><i data-lucide="upload"></i> Importar</button>
                    <button class="danger-button" type="button" data-admin-action="reset-default"><i data-lucide="rotate-ccw"></i> Restaurar padrão</button>
                </div>
            </section>
        `;
    }

    function textArrayEditor(path, values) {
        return `<div class="admin-list">
            ${values.map((value, index) => listItem(`Item ${index + 1}`, path, index, `
                ${fieldHtml("Texto", `${path}.${index}`, "textarea", value)}
            `)).join("")}
        </div>`;
    }

    function listItem(title, path, index, body, options = {}) {
        return `
            <div class="list-item">
                <div class="list-item-header">
                    <div class="list-item-title">${escapeHtml(title)}</div>
                    <div class="list-actions">
                        <button class="small-button" type="button" data-admin-action="move" data-path="${escapeAttr(path)}" data-index="${index}" data-dir="-1"><i data-lucide="arrow-up"></i></button>
                        <button class="small-button" type="button" data-admin-action="move" data-path="${escapeAttr(path)}" data-index="${index}" data-dir="1"><i data-lucide="arrow-down"></i></button>
                        <button class="${options.canDelete === false ? "small-button" : "danger-button"}" type="button" data-admin-action="remove" data-path="${escapeAttr(path)}" data-index="${index}" ${options.canDelete === false ? "disabled" : ""}><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                ${body}
            </div>
        `;
    }

    function fieldHtml(label, path, type, value, options = {}) {
        const id = options.plainId || `field-${path.replace(/[^a-z0-9]/gi, "-")}`;
        const dataPath = options.noPath ? "" : `data-path="${escapeAttr(path)}"`;
        const extra = [
            options.lines ? 'data-lines="true"' : "",
            options.paragraphs ? 'data-paragraphs="true"' : "",
            options.imageList ? 'data-image-list="true"' : ""
        ].filter(Boolean).join(" ");

        if (type === "textarea") {
            return `<div class="field"><label for="${escapeAttr(id)}">${escapeHtml(label)}</label><textarea id="${escapeAttr(id)}" ${dataPath} ${extra}>${escapeHtml(value || "")}</textarea></div>`;
        }

        return `<div class="field"><label for="${escapeAttr(id)}">${escapeHtml(label)}</label><input id="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value || "")}" ${dataPath} ${extra}></div>`;
    }

    function imageFieldHtml(label, path, value) {
        return `<div class="field">
            <label>${escapeHtml(label)}</label>
            <input type="text" value="${escapeAttr(value || "")}" data-path="${escapeAttr(path)}" placeholder="URL ou caminho da imagem">
            <input type="file" accept="image/*" data-upload-path="${escapeAttr(path)}">
        </div>`;
    }

    function selectHtml(label, path, value, options) {
        return `<div class="field"><label>${escapeHtml(label)}</label><select data-path="${escapeAttr(path)}">
            ${options.map(([optionValue, optionLabel]) => `<option value="${escapeAttr(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`).join("")}
        </select></div>`;
    }

    function handleAdminInput(event) {
        const target = event.target;

        if (target.matches("[data-upload-path]")) {
            handleUpload(target);
            return;
        }

        if (!target.matches("[data-path]")) return;
        let value;
        if (target.type === "checkbox") {
            value = target.checked;
        } else if (target.dataset.lines === "true") {
            value = splitLines(target.value);
        } else if (target.dataset.paragraphs === "true") {
            value = splitParagraphs(target.value);
        } else if (target.dataset.imageList === "true") {
            value = parseImageList(target.value);
        } else {
            value = target.value;
        }

        setPath(siteData, target.dataset.path, value);
        syncCustomNav(siteData);
        applyTheme(siteData.theme);
        markDirty();
    }

    async function handleUpload(input) {
        const file = input.files && input.files[0];
        if (!file) return;
        const dataUrl = await fileToDataUrl(file);
        let finalUrl = dataUrl;

        if (isHttp) {
            const response = await fetch("api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ fileName: file.name, dataUrl })
            });
            if (response.ok) {
                const payload = await response.json();
                finalUrl = payload.url || dataUrl;
            }
        }

        setPath(siteData, input.dataset.uploadPath, finalUrl);
        markDirty();
        renderAdminPanel();
    }

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function handleAdminAction(event) {
        const button = event.target.closest("[data-admin-action]");
        if (!button) return;
        const action = button.dataset.adminAction;

        if (action === "save") {
            try {
                await persistData();
                dirty = false;
                updateSaveStatus("Tudo salvo", "saved");
            } catch (error) {
                updateSaveStatus("Erro ao salvar", "dirty");
                alert(error.message);
            }
            return;
        }

        if (action === "logout") {
            sessionStorage.removeItem("gepera.admin");
            if (isHttp) {
                await fetch("api/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
            }
            renderLogin();
            return;
        }

        if (action === "add") {
            const array = getPath(siteData, button.dataset.path);
            if (Array.isArray(array)) {
                array.push(templateFor(button.dataset.template));
                markDirty();
                renderAdminPanel();
            }
            return;
        }

        if (action === "add-custom-page") {
            const slug = uniqueSlug("nova-pagina");
            const page = {
                id: `custom-${slug}`,
                slug,
                label: "Nova página",
                eyebrow: "Página personalizada",
                title: "Nova página",
                intro: "Edite este texto no painel administrativo.",
                layout: "editorial",
                sections: [templateFor("customSection")]
            };
            siteData.customPages.push(page);
            siteData.nav.push({ id: page.id, label: page.label, type: "custom", slug: page.slug, visible: true });
            markDirty();
            renderAdminPanel();
            return;
        }

        if (action === "remove") {
            const array = getPath(siteData, button.dataset.path);
            const index = Number(button.dataset.index);
            if (Array.isArray(array) && Number.isInteger(index)) {
                const removed = array.splice(index, 1)[0];
                if (button.dataset.path === "customPages" && removed) {
                    siteData.nav = siteData.nav.filter((item) => item.id !== removed.id);
                }
                if (button.dataset.path === "nav" && removed && removed.type === "custom") {
                    siteData.customPages = siteData.customPages.filter((page) => page.id !== removed.id);
                }
                markDirty();
                renderAdminPanel();
            }
            return;
        }

        if (action === "move") {
            const array = getPath(siteData, button.dataset.path);
            const index = Number(button.dataset.index);
            const dir = Number(button.dataset.dir);
            const next = index + dir;
            if (Array.isArray(array) && next >= 0 && next < array.length) {
                [array[index], array[next]] = [array[next], array[index]];
                markDirty();
                renderAdminPanel();
            }
            return;
        }

        if (action === "download-json") {
            downloadJson();
            return;
        }

        if (action === "import-json") {
            const textarea = document.getElementById("importJson");
            try {
                siteData = normalizeData(JSON.parse(textarea.value));
                markDirty();
                renderAdminShell();
            } catch {
                alert("JSON inválido.");
            }
            return;
        }

        if (action === "reset-default" && confirm("Restaurar o conteúdo padrão do site?")) {
            siteData = normalizeData(clone(DEFAULT_DATA));
            markDirty();
            renderAdminShell();
        }
    }

    function markDirty() {
        dirty = true;
        updateSaveStatus("Alterações pendentes", "dirty");
    }

    function updateSaveStatus(text, className) {
        const status = document.getElementById("saveStatus");
        if (!status) return;
        status.textContent = text;
        status.className = `status-pill ${className}`;
    }

    function downloadJson() {
        const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "gepera-site-data.json";
        link.click();
        URL.revokeObjectURL(url);
    }

    function templateFor(type) {
        const templates = {
            social: { label: "Novo link", url: "" },
            carousel: { title: "Novo slide", caption: "", image: "" },
            timeline: { year: "2026", title: "Novo marco", body: "" },
            text: "Novo texto",
            researchTab: { title: "Nova aba", body: "" },
            researchLine: { icon: "book-open", title: "Nova linha", body: "" },
            researcher: { name: "Novo pesquisador", role: "Pesquisador", area: "", photo: "", bio: "", lattes: "", email: "" },
            action: { title: "Nova ação", category: "Eventos", date: "2026", location: "", description: "", link: "", images: [] },
            publication: { title: "Nova publicação", type: "Artigo", authors: "", year: "2026", venue: "", summary: "", link: "", cover: "" },
            customSection: { title: "Nova seção", body: "", image: "" }
        };
        return clone(templates[type] || {});
    }

    function setPath(object, path, value) {
        const keys = path.split(".");
        let cursor = object;
        keys.slice(0, -1).forEach((key) => {
            cursor = cursor[key];
        });
        cursor[keys[keys.length - 1]] = value;
    }

    function getPath(object, path) {
        return path.split(".").reduce((cursor, key) => cursor && cursor[key], object);
    }

    function splitLines(value) {
        return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    }

    function splitParagraphs(value) {
        return value.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean);
    }

    function textToParagraphs(value) {
        return String(value || "").split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean);
    }

    function imageListValue(images) {
        return (images || []).map((item) => `${item.image || ""}${item.caption ? ` | ${item.caption}` : ""}`).join("\n");
    }

    function parseImageList(value) {
        return splitLines(value).map((line) => {
            const [image, ...caption] = line.split("|");
            return { image: image.trim(), caption: caption.join("|").trim() };
        });
    }

    function uniqueSlug(base) {
        let slug = sanitizeSlug(base);
        let counter = 2;
        while (siteData.customPages.some((page) => page.slug === slug)) {
            slug = `${sanitizeSlug(base)}-${counter}`;
            counter += 1;
        }
        return slug;
    }

    function sanitizeSlug(value) {
        return String(value || "pagina")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "pagina";
    }

    function emptyCustomPage() {
        return {
            eyebrow: "Página",
            title: "Página não encontrada",
            intro: "Esta página personalizada ainda não foi cadastrada.",
            layout: "editorial",
            sections: []
        };
    }

    function icon(name) {
        return node("i", { "data-lucide": name, "aria-hidden": "true" });
    }

    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function node(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([key, value]) => {
            if (value === false || value === null || value === undefined) return;
            if (key === "class") element.className = value;
            else if (key === "text") element.textContent = value;
            else element.setAttribute(key, value === true ? "" : value);
        });
        append(element, children);
        return element;
    }

    function append(parent, children) {
        if (children === null || children === undefined) return;
        if (!Array.isArray(children)) {
            children = [children];
        }
        children.forEach((child) => {
            if (child === null || child === undefined) return;
            parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
        });
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }
})();
