import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import { SearchBar } from "@/components/SearchBar";
import logo from "@/assets/logo-brutal.png";
const WHATSAPP_NUMBER = "541147180732"; // +54 (11) 4718-0732

const navigation = [
  {
    name: "INICIO",
    href: "/",
  },
  {
    name: "RENTAL",
    href: "/equipos",
  },
  {
    name: "GALERÍA",
    href: "/galeria",
  },
  {
    name: "SALA",
    href: "/sala-grabacion",
  },
  //  { name: "SERVICIOS", href: "/servicios" },
  {
    name: "CONTACTO",
    href: "/contacto",
  },
  {
    name: "PRESUPUESTO",
    href: "/cotizador",
  },
];
export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isVisible, setIsVisible, isHovering, setIsHovering, isMobile } = useHeaderVisibility();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep visible when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      setIsVisible(true);
    }
  }, [mobileMenuOpen, setIsVisible]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!mobileMenuOpen) return;
      const target = event.target as Node;
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(target);
      const isOutsideButton = menuButtonRef.current && !menuButtonRef.current.contains(target);
      if (isOutsideMenu && isOutsideButton) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Auto-close menu after 5 seconds
  useEffect(() => {
    if (mobileMenuOpen) {
      autoCloseTimerRef.current = setTimeout(() => {
        setMobileMenuOpen(false);
      }, 5000);
    }
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [mobileMenuOpen]);

  // Reset timer on menu interaction
  const resetAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      setMobileMenuOpen(false);
    }, 5000);
  }, []);
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
      {/* Hover trigger zone - only on desktop (non-touch devices) */}
      {!isMobile && <div className="fixed top-0 left-0 right-0 h-4 z-[51]" onMouseEnter={handleMouseEnter} />}

      {/* Mobile: Floating hamburger button only */}
      {isMobile && (
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-3 right-3 z-[60] h-10 w-10 bg-background/80 backdrop-blur-sm border border-foreground shadow-brutal-sm flex items-center justify-center touch-manipulation"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
      )}

      {/* Mobile: Vertical dropdown menu */}
      {isMobile && mobileMenuOpen && (
        <div
          ref={menuRef}
          className="fixed top-14 right-3 z-[70] w-64 bg-background border border-foreground shadow-brutal pointer-events-auto"
          onTouchStart={resetAutoCloseTimer}
          onMouseMove={resetAutoCloseTimer}
        >
          <div className="flex flex-col">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 font-heading text-sm touch-manipulation border-b border-foreground/20 last:border-b-0 ${location.pathname === item.href ? "bg-primary text-primary-foreground" : "bg-background text-foreground active:bg-foreground active:text-background"}`}
                style={{
                  WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                }}
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
              className="flex items-center gap-3 px-4 py-3 font-heading text-sm bg-green-500 text-white active:bg-green-600 touch-manipulation border-b border-foreground/20"
              style={{
                WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
              }}
            >
              <MessageCircle className="h-5 w-5" />
              WHATSAPP
            </a>

            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 font-heading text-sm bg-primary text-primary-foreground text-center touch-manipulation border-b border-foreground/20"
                style={{
                  WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                }}
              >
                ADMIN PANEL
              </Link>
            )}

            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                  navigate("/");
                }}
                className="block w-full px-4 py-3 font-heading text-sm bg-background text-foreground text-center touch-manipulation"
                style={{
                  WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                }}
              >
                CERRAR SESIÓN
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 font-heading text-sm bg-primary text-primary-foreground text-center touch-manipulation"
                style={{
                  WebkitTapHighlightColor: "rgba(0,0,0,0.1)",
                }}
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Desktop Header - only visible on non-touch devices */}
      {!isMobile && (
        <header
          className={`fixed top-0 left-0 right-0 z-[65] bg-transparent border-b border-foreground transition-transform duration-300 ${isVisible || isHovering ? "translate-y-0" : "-translate-y-full"}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <nav className="w-full flex items-center justify-center px-4 py-3 backdrop-blur-sm">
            <div className="flex h-10 lg:h-14 items-center justify-center gap-4">
              {/* Logo Brutal */}
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Ala Norte" className="h-full w-auto object-contain mx-8" />
              </Link>

              {/* Desktop Navigation Brutal */}
              <div className="flex flex-wrap items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 xl:px-6 h-10 xl:h-12 flex items-center justify-center font-heading text-xs xl:text-sm tracking-wider border transition-none flex-shrink-0 ${location.pathname === item.href ? "bg-primary text-primary-foreground border-foreground shadow-brutal-sm" : "bg-background border-transparent hover:border-foreground hover:shadow-brutal-sm"}`}
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
                  className="h-10 w-10 xl:h-12 xl:w-12 hover:bg-green-500 hover:text-white"
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

                {user && isAdmin ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="h-10 xl:h-12 text-xs xl:text-sm">
                      <Link to="/admin">ADMIN</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        signOut();
                        navigate("/");
                      }}
                      className="h-10 w-10 xl:h-12 xl:w-12"
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
                    className="h-10 w-10 xl:h-12 xl:w-12"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4 xl:h-5 xl:w-5" />
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="h-10 xl:h-12 text-xs xl:text-sm">
                    <Link to="/auth">LOGIN</Link>
                  </Button>
                )}
              </div>
            </div>
          </nav>
        </header>
      )}
    </>
  );
};
