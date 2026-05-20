import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";

interface Section {
  title: string;
  links: { path: string; label: string }[];
}

const sections: Section[] = [
  {
    title: "Páginas principales",
    links: [
      { path: "/", label: "Inicio" },
      { path: "/equipos", label: "Rental" },
      { path: "/galeria", label: "Galería" },
      { path: "/sala-grabacion", label: "Sala de Sonido y Postproducción" },
      { path: "/servicios", label: "Servicios" },
      { path: "/contacto", label: "Contacto" },
      { path: "/cotizador", label: "Cotizador" },
    ],
  },
  {
    title: "Marcas y Productos",
    links: [
      { path: "/cartoni", label: "Cartoni — Seller & Service Oficial" },
    ],
  },
];

export default function MapaSitio() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Mapa de Sitio — Ala Norte"
        description="Navegación completa del sitio Ala Norte. Encontrá todas las páginas: rental, galería, sala de sonido, servicios y más."
        path="/mapa-sitio"
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1
          className="font-sans font-thin text-foreground mb-12 sm:mb-16"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          MAPA DE SITIO
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 border-b border-border pb-2">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-foreground hover:text-primary transition-brutal text-base sm:text-lg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Si no encontrás lo que buscás, escribinos a{" "}
            <a
              href="mailto:info@alanortecinedigital.com"
              className="text-primary hover:underline"
            >
              info@alanortecinedigital.com
            </a>{" "}
            o usá el{" "}
            <Link to="/contacto" className="text-primary hover:underline">
              formulario de contacto
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
