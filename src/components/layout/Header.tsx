import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { SearchBar } from "@/components/SearchBar";
import logo from "@/assets/logo-brutal.png";

const navigation = [
  { name: "EQUIPOS", href: "/equipos" },
  { name: "ESPACIOS", href: "/espacios" },
  { name: "SERVICIOS", href: "/servicios" },
  { name: "COMUNIDAD", href: "/comunidad" },
  { name: "SOPORTE", href: "/soporte" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-cinema-sm">
      <nav className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-cinema hover:opacity-80">
            <img src={logo} alt="Ala Norte" className="h-8 sm:h-10 md:h-11 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 xl:px-5 h-9 flex items-center justify-center font-heading text-xs xl:text-sm tracking-wide rounded-md transition-cinema ${
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-cinema-sm"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <SearchBar />
            
            {/* Cart Badge */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative hidden sm:inline-flex h-9 w-9 sm:h-10 sm:w-10 rounded-full"
            >
              <Link to="/cotizador">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs rounded-full animate-glow"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:inline-flex h-9 w-9 sm:h-10 sm:w-10 rounded-full"
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
                  variant="outline"
                  size="sm"
                  className="hidden lg:inline-flex h-9 text-xs"
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
                  className="hidden lg:inline-flex h-9 w-9 rounded-full"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
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
                className="hidden lg:inline-flex h-9 w-9 rounded-full"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden lg:inline-flex h-9 text-xs"
              >
                <Link to="/auth">LOGIN</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 rounded-full"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-border mt-2 animate-fade-in">
            <div className="flex flex-col gap-2 mt-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 font-heading text-sm rounded-md transition-cinema ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/cotizador"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 font-heading text-sm rounded-md transition-cinema bg-muted hover:bg-muted/80 flex items-center justify-between"
              >
                <span>CARRITO</span>
                {totalItems > 0 && (
                  <Badge variant="destructive" className="ml-2 rounded-full">
                    {totalItems}
                  </Badge>
                )}
              </Link>
              <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-md">
                <span className="font-heading text-sm">MODO</span>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
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
  );
};
