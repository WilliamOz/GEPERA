import AnimeExperience from "./AnimeExperience";
import MapboxFooter from "./MapboxFooter";
import NavBar from "./NavBar";

export default function SiteChrome({ data, children }) {
  const navData = {
    nav: data.nav,
    settings: {
      abbreviation: data.settings.abbreviation,
      logo: data.settings.logo,
      siteName: data.settings.siteName,
      socialLinks: data.settings.socialLinks
    }
  };

  return (
    <div className="app-shell">
      <NavBar data={navData} />
      <AnimeExperience />
      <main className="site-main">{children}</main>
      <MapboxFooter data={data} />
    </div>
  );
}
