import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import { SearchBar } from "@/components/SearchBar";
const logo = "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/publicimages/uiu/Logo_Horizontal_blanco.png";
const WHATSAPP_NUMBER = "5491126824709";

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
  // { name: "SERVICIOS", href: "/servicios" },
  {
    name: "CARTONI",
    href: "/cartoni",
  },
  {
    name: "CONTACTO",
    href: "/contacto",
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
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          className="fixed top-3 right-3 z-[60] h-10 w-10 bg-background/30 backdrop-blur-sm border border-background shadow-brutal-sm flex items-center justify-center touch-manipulation"
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

            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 font-heading text-sm bg-primary text-primary-foreground touch-manipulation border-b border-foreground/20 text-left"
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
          className={`fixed top-0 left-0 right-0 z-[65] bg-transparent border-b border-background transition-transform duration-300 ${isVisible || isHovering ? "translate-y-0" : "-translate-y-full"}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <nav className="max-w-screen-xl mx-auto flex items-center justify-center px-10 py-3 backdrop-blur-sm">
            <div className="flex w-full h-12 items-center justify-between">
              {/* Logo Brutal */}
              <Link to="/" className="flex items-center h-full p pb-[4px]">
                <img src="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/publicimages/uiu/logoHblanco.png" alt="Ala Norte" className="h-full w-auto object-contain" />
              </Link>

              {/* Desktop Navigation Brutal */}
              <div className="flex flex-1 justify-center gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center justify-center
                      px-6
                      h-8
                      rounded-sm
                      font-heading text-xs xl:text-xs tracking-tight font-medium
                      transition-colors
                      ${location.pathname === item.href ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-foregroun hover:text-background"}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Actions Brutales */}
              <div className="flex items-center gap-2">
                {/* Search wrapper */}
                <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-background hover:bg-primary hover:text-primary-foreground transition-colors">
                  <SearchBar />
                </div>

                {/* Cart */}
                <Link
                  to="/cotizador"
                  className="relative flex items-center justify-center h-8 w-8 rounded-sm bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0 -right-0 bg-primary text-primary-foreground text-2 rounded-full h-4 w-4 flex items-center justify-center border text-xs font-medium">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* ADMIN */}
                {user && isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-center h-8 px-6 rounded-sm font-heading text-xs xl:text-sm tracking-tight bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    ADMIN
                  </Link>
                )}

                {/* Logout / Login */}
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                    className="flex items-center justify-center h-8 px-2 rounded-sm bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4 xl:h-5 xl:w-5" />
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center justify-center h-8 px-6 rounded-sm font-heading text-xs xl:text-sm tracking-tight bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    LOGIN
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </header>
      )}
    </>
  );
};
