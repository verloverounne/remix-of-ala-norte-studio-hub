import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background border-t-4 border-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold text-primary">
              ALA NORTE
            </h3>
            <p className="text-sm opacity-80">
              Rental audiovisual y productora profesional. Espacios, equipos y servicios de primer nivel.
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
                  Equipos
                </Link>
              </li>
              <li>
                <Link to="/espacios" className="text-sm hover:text-primary transition-brutal">
                  Espacios
                </Link>
              </li>
              <li>
                <Link to="/cotizador" className="text-sm hover:text-primary transition-brutal">
                  Cotizador
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+54 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@alanorte.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">Síguenos</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-primary transition-brutal"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-brutal"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-brutal"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-background/20 text-center text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} Ala Norte. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
