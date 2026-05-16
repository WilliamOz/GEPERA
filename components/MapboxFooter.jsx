"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin } from "lucide-react";

const UEPA_CENTER = [-48.4888577, -1.4317073];
const UEPA_ADDRESS = "UEPA - R. do Úna, n° 156 - Telégrafo, Belém - PA, 66050-540";

export default function MapboxFooter({ data }) {
  const containerRef = useRef(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current) return undefined;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: UEPA_CENTER,
      zoom: 15.6,
      attributionControl: false
    });

    new mapboxgl.Marker({ color: "#00703c" })
      .setLngLat(UEPA_CENTER)
      .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(UEPA_ADDRESS))
      .addTo(map);

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    return () => map.remove();
  }, [token]);

  return (
    <footer className="dashboard-footer" id="contato">
      <div className="footer-grid">
        <section className="footer-brand-panel magic-card">
          <img src={data.settings.logo} alt="" />
          <div>
            <strong>{data.settings.abbreviation}</strong>
            <p>{data.settings.siteName}</p>
          </div>
          <ul>
            {(data.settings.contactLines || []).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="footer-map-panel magic-card">
          <div className="footer-map-head">
            <MapPin size={22} />
            <div>
              <span>Localização</span>
              <strong>{UEPA_ADDRESS}</strong>
            </div>
          </div>
          {token ? (
            <div ref={containerRef} className="mapbox-frame" aria-label={UEPA_ADDRESS} />
          ) : (
            <div className="mapbox-fallback">
              <MapPin size={42} />
              <strong>Mapa Mapbox configurado</strong>
              <p>Adicione `NEXT_PUBLIC_MAPBOX_TOKEN` no ambiente para renderizar o mapa interativo.</p>
              <small>Centro: {UEPA_CENTER[1]}, {UEPA_CENTER[0]}</small>
            </div>
          )}
        </section>

        <section className="footer-logos">
          {(data.settings.footerLogos || []).map((logo) => (
            <a key={logo.label} href={logo.url || "#"} target="_blank" rel="noreferrer">
              <img src={logo.image} alt={logo.label} />
            </a>
          ))}
        </section>
      </div>
    </footer>
  );
}
