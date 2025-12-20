import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-5">
            <h3 className="text-3xl font-heading font-semibold text-primary tracking-wide">
              ALA NORTE
            </h3>
            <p className="text-sm leading-relaxed opacity-70">
              Rental audiovisual y productora profesional. Espacios, equipos y servicios de primer nivel.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-5">
            <h4 className="font-semibold text-lg tracking-wide">Navegación</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-cinema">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/equipos" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-cinema">
                  Equipos
                </Link>
              </li>
              <li>
                <Link to="/espacios" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-cinema">
                  Espacios
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-cinema">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-cinema">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/cotizador" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-cinema">
                  Cotizador
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="font-semibold text-lg tracking-wide">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-cinema">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="opacity-70">+54 (11) 4718-0732</span>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-cinema">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="opacity-70">info@alanortecinedigital.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-cinema">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="opacity-70">V. S. de Liniers 1565 - Vte. Lopez - BA</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-5">
            <h4 className="font-semibold text-lg tracking-wide">Síguenos</h4>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/alanortecinedigital/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:shadow-cinema-glow transition-cinema"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linktr.ee/alanortecinedigital"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:shadow-cinema-glow transition-cinema"
                aria-label="Linktree"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5108 5.85343L17.5158 1.73642L19.8404 4.11701L15.6393 8.12199H21.5488V11.4268H15.6113L19.8404 15.5345L17.5158 17.8684L11.7744 12.099L6.03299 17.8684L3.70842 15.5438L7.93745 11.4361H2V8.12199H7.90944L3.70842 4.11701L6.03299 1.73642L10.038 5.85343V0H13.5108V5.85343ZM10.038 16.16H13.5108V24H10.038V16.16Z"/>
                </svg>
              </a>
            </div>
            <p className="text-xs opacity-50 mt-3">
              Síguenos en nuestras redes para ver contenido exclusivo y novedades
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 text-center">
          <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} Ala Norte. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
