import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ShoppingCart, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import { SearchBar } from "@/components/SearchBar";
import logo from "@/assets/logo-brutal.png";

const WHATSAPP_NUMBER = "541147180732"; // +54 (11) 4718-0732

const navigation = [
  { name: "RENTAL", href: "/equipos" },
  { name: "GALERÍA", href: "/galeria" },
  { name: "SALA", href: "/sala-grabacion" },
  { name: "SERVICIOS", href: "/servicios" },
  { name: "CONTACTO", href: "/contacto" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Detectar tema inicial: localStorage > clase HTML > preferencia del sistema > default dark
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (savedTheme) {
        // Aplicar inmediatamente al detectar
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return savedTheme;
      }
      if (document.documentElement.classList.contains("dark")) return "dark";
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        return "dark";
      }
    }
    return "dark"; // Default: dark mode
  });
  const { isVisible, setIsVisible, isHovering, setIsHovering } = useHeaderVisibility();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();

  // Sincronizar tema con DOM al montar y cuando cambia
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Keep visible when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      setIsVisible(true);
    }
  }, [mobileMenuOpen, setIsVisible]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (!mobileMenuOpen) {
      setIsVisible(false);
    }
  };

  return (
    <>
      {/* Hover trigger zone - always visible at top */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-[51]"
        onMouseEnter={handleMouseEnter}
      />
      
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground transition-transform duration-300 ${
          isVisible || isHovering ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <nav className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo Brutal */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Ala Norte" 
              width={48}
              height={51}
              className="h-8 sm:h-10 md:h-12 w-auto object-contain" 
            />
          </Link>

          {/* Desktop Navigation Brutal */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 xl:px-6 h-10 xl:h-12 flex items-center justify-center font-heading text-xs xl:text-sm tracking-wider border transition-none flex-shrink-0 ${
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground border-foreground shadow-brutal-sm"
                    : "bg-transparent border-transparent hover:border-foreground hover:shadow-brutal-sm"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions Brutales */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* Search */}
            <SearchBar />

            {/* WhatsApp Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:inline-flex h-10 w-10 xl:h-12 xl:w-12 hover:bg-green-500 hover:text-white"
              aria-label="Contactar por WhatsApp"
            >
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola, me gustaría obtener información`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:inline-flex h-10 w-10 xl:h-12 xl:w-12"
              aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            {user && isAdmin ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden lg:inline-flex h-10 xl:h-12 text-xs xl:text-sm"
                >
                  <Link to="/admin">ADMIN</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                  className="hidden lg:inline-flex h-10 w-10 xl:h-12 xl:w-12"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4 xl:h-5 xl:w-5" />
                </Button>
              </>
            ) : user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                className="hidden lg:inline-flex h-10 w-10 xl:h-12 xl:w-12"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 xl:h-5 xl:w-5" />
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex h-10 xl:h-12 text-xs xl:text-sm"
              >
                <Link to="/auth">LOGIN</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-10 w-10"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Brutal */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 mt-2">
            <div className="flex flex-col gap-2 mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 font-heading text-sm transition-none ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-foreground hover:text-background"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* WhatsApp en móvil */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola, me gustaría obtener información`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 font-heading text-sm bg-green-500 text-white hover:bg-green-600"
              >
                <MessageCircle className="h-5 w-5" />
                WHATSAPP
              </a>
              
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-heading text-sm">MODO</span>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10" aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}>
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {user && isAdmin && (
                <Button 
                  asChild 
                  variant="default" 
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/admin">ADMIN PANEL</Link>
                </Button>
              )}
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                    navigate("/");
                  }}
                >
                  CERRAR SESIÓN
                </Button>
              ) : (
                <Button 
                  asChild 
                  variant="default" 
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/auth">LOGIN</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
    </>
  );
};
