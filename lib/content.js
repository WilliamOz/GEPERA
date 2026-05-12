import { getSiteContent } from "./db";
export { hrefFor, visibleNav } from "./nav";

export function assetPath(value) {
  if (!value) return "";
  if (/^(https?:|data:|mailto:)/.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function publicData() {
  const data = getSiteContent();
  return normalizeAssets(data);
}

function normalizeAssets(input) {
  const data = JSON.parse(JSON.stringify(input || {}));
  if (data.settings) {
    data.settings.logo = assetPath(data.settings.logo);
    for (const logo of data.settings.footerLogos || []) logo.image = assetPath(logo.image);
  }
  if (data.pages?.home) data.pages.home.heroImage = assetPath(data.pages.home.heroImage);

  for (const slide of data.pages?.sobre?.carousel || []) slide.image = assetPath(slide.image);
  for (const image of data.pages?.pesquisa?.images || []) image.image = assetPath(image.image);
  for (const person of data.pages?.pesquisadores?.researchers || []) person.photo = assetPath(person.photo);
  for (const action of data.pages?.acoes?.actions || []) {
    for (const image of action.images || []) image.image = assetPath(image.image);
  }
  for (const publication of data.pages?.acoes?.publications || []) {
    publication.cover = assetPath(publication.cover);
    publication.link = assetPath(publication.link);
  }
  return data;
}
