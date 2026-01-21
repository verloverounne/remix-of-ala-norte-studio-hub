import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background border-t border-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold text-primary">ALA NORTE</h3>
            <p className="text-sm opacity-80">
              Equipamiento curado, espacios profesionales, asesoramiento técnico dedicado y formación continua. Desde el
              norte hasta el sur, acompañamos a equipos independientes con trato humano, calidad y empatía.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary transition-brutal">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/equipos" className="text-sm hover:text-primary transition-brutal">
                  Rental
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-sm hover:text-primary transition-brutal">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/sala-grabacion" className="text-sm hover:text-primary transition-brutal">
                  Sala de Sonido y Postproducción
                </Link>
              </li>
              {/*         <li>
                <Link to="/blog" className="text-sm hover:text-primary transition-brutal">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-sm hover:text-primary transition-brutal">
                  Nosotros
                </Link>
              </li>
        */}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+54 (11) 4718-0732</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@alanortecinedigital.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>V. S. de Liniers 1565 - Vte. Lopez - BA</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">Seguinos</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/alanortecinedigital/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-brutal"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linktr.ee/alanortecinedigital"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-brutal"
                aria-label="Linktree"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5108 5.85343L17.5158 1.73642L19.8404 4.11701L15.6393 8.12199H21.5488V11.4268H15.6113L19.8404 15.5345L17.5158 17.8684L11.7744 12.099L6.03299 17.8684L3.70842 15.5438L7.93745 11.4361H2V8.12199H7.90944L3.70842 4.11701L6.03299 1.73642L10.038 5.85343V0H13.5108V5.85343ZM10.038 16.16H13.5108V24H10.038V16.16Z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-background/70 mt-2">
              Seguinos para ver contenido exclusivo, tutoriales técnicos y novedades de nuestra comunidad audiovisual
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-background/20 text-center text-sm opacity-70">
          <p>
            &copy; {new Date().getFullYear()} Ala Norte. Diseño y Desarrollo: Verónica Seniquel @verlovero. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
