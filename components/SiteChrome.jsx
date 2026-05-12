import ButterScrollFrame from "./ButterScrollFrame";
import GsapExperience from "./GsapExperience";
import NavBar from "./NavBar";
import { hrefFor, visibleNav } from "@/lib/nav";

export default function SiteChrome({ data, children }) {
  const footerLogos = data.settings.footerLogos || [];
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
    <>
      <NavBar data={navData} />
      <ButterScrollFrame>
        <GsapExperience />
        <main>{children}</main>
        <footer className="site-footer-next" id="contato">
          <div className="site-wrap footer-grid-next">
            <div>
              <a className="footer-brand-lockup" href="/">
                {data.settings.logo && <img src={data.settings.logo} alt="" />}
                <div>
                  <div className="footer-brand-next">{data.settings.abbreviation}</div>
                  <p>{data.settings.siteName}</p>
                </div>
              </a>
            </div>
            <div>
              <ul>
                {visibleNav(data).map((item) => (
                  <li key={item.id}>
                    <a href={hrefFor(item)}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ul>
                {(data.settings.contactLines || []).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            {footerLogos.length > 0 && (
              <div className="footer-logo-strip" aria-label="Instituições e plataformas">
                {footerLogos.map((logo) => {
                  const image = <img src={logo.image} alt={logo.label} />;
                  return logo.url ? (
                    <a key={logo.label} href={logo.url} target="_blank" rel="noreferrer">
                      {image}
                    </a>
                  ) : (
                    <span key={logo.label}>{image}</span>
                  );
                })}
              </div>
            )}
          </div>
        </footer>
      </ButterScrollFrame>
    </>
  );
}
