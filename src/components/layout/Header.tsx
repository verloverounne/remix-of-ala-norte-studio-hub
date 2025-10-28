import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-4 border-foreground shadow-brutal">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Brutal */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Ala Norte" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation Brutal */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-6 py-3 font-heading text-sm tracking-wider border-3 transition-none ${
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:inline-flex border-3 border-foreground"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <Button
              asChild
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link to="/admin">ADMIN</Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border-3 border-foreground"
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
          <div className="md:hidden pb-4 border-t-3 border-foreground mt-4">
            <div className="flex flex-col gap-2 mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 font-heading text-sm border-3 border-foreground transition-none ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-foreground hover:text-background"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center justify-between px-4 py-3 border-3 border-foreground">
                <span className="font-heading text-sm">TEMA</span>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="border-2 border-foreground">
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <Button asChild variant="default" size="sm">
                <Link to="/admin">ADMIN PANEL</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
