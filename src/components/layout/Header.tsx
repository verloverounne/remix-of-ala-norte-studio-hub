import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-brutal.png";

const navigation = [
  { name: "INICIO", href: "/" },
  { name: "EQUIPOS", href: "/equipos" },
  { name: "ESPACIOS", href: "/espacios" },
  { name: "COTIZADOR", href: "/cotizador" },
  { name: "CONTACTO", href: "/contacto" },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Brutal */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Ala Norte" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation Brutal */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-6 h-12 flex items-center justify-center font-heading text-sm tracking-wider border-2 transition-none ${
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
          <div className="flex items-center gap-2">
            {/* Cart Badge */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex border-2 border-foreground h-12 w-12"
            >
              <Link to="/cotizador">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
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
              className="hidden md:inline-flex border-2 border-foreground h-12 w-12"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {user && isAdmin ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="hidden md:inline-flex h-12"
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
                  className="hidden md:inline-flex border-2 border-foreground h-12 w-12"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
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
                className="hidden md:inline-flex border-2 border-foreground h-12 w-12"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="default"
                className="hidden md:inline-flex h-12"
              >
                <Link to="/auth">LOGIN</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border-2 border-foreground"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Brutal */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t-2 border-foreground mt-4">
            <div className="flex flex-col gap-2 mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 font-heading text-sm border-2 border-foreground transition-none ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-foreground hover:text-background"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/cotizador"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 font-heading text-sm border-2 border-foreground transition-none bg-background hover:bg-foreground hover:text-background flex items-center justify-between"
              >
                <span>CARRITO</span>
                {totalItems > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {totalItems}
                  </Badge>
                )}
              </Link>
              <div className="flex items-center justify-between px-4 py-3 border-2 border-foreground">
                <span className="font-heading text-sm">TEMA</span>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="border-2 border-foreground">
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
