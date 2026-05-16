import "swiper/css";
import "swiper/css/pagination";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

export const metadata = {
  title: "GEPERA",
  description: "Grupo de Estudos e Pesquisas em Ensino Religioso na Amazônia"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
