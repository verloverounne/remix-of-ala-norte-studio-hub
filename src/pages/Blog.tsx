import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ArrowRight } from "lucide-react";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    "Todos",
    "Equipos",
    "Técnicas",
    "Entrevistas",
    "Proyectos",
    "Tutoriales"
  ];

  const articles = [
    {
      id: 1,
      title: "Cómo elegir la cámara perfecta para tu próximo proyecto",
      category: "Equipos",
      author: "Carlos Martínez",
      date: "10 Nov 2025",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=500&fit=crop",
      excerpt: "Guía completa para seleccionar la cámara ideal según tu presupuesto, género y necesidades técnicas.",
      featured: true
    },
    {
      id: 2,
      title: "Entrevista: Directores de Fotografía Argentinos",
      category: "Entrevistas",
      author: "Laura Fernández",
      date: "5 Nov 2025",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=500&fit=crop",
      excerpt: "Conversamos con tres DF's sobre su experiencia, workflow y consejos para jóvenes cineastas.",
      featured: true
    },
    {
      id: 3,
      title: "Behind the Scenes: Rodaje en Bariloche",
      category: "Proyectos",
      author: "María González",
      date: "1 Nov 2025",
      image: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=800&h=500&fit=crop",
      excerpt: "Un vistazo al proceso de filmación de un documental en la Patagonia con equipos Ala Norte.",
      featured: true
    },
    {
      id: 4,
      title: "Iluminación natural vs artificial: ¿Cuándo usar cada una?",
      category: "Técnicas",
      author: "Juan Pérez",
      date: "28 Oct 2025",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=500&fit=crop",
      excerpt: "Consejos prácticos para aprovechar la luz natural y complementarla con luces artificiales.",
      featured: false
    },
    {
      id: 5,
      title: "Tutorial: Configuración básica de cámaras RED",
      category: "Tutoriales",
      author: "Carlos Martínez",
      date: "25 Oct 2025",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
      excerpt: "Paso a paso para configurar correctamente tu cámara RED antes del rodaje.",
      featured: false
    },
    {
      id: 6,
      title: "Los mejores lentes para cine independiente",
      category: "Equipos",
      author: "Laura Fernández",
      date: "22 Oct 2025",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
      excerpt: "Análisis de los lentes más versátiles y accesibles para producciones con presupuesto ajustado.",
      featured: false
    },
    {
      id: 7,
      title: "Sonido directo: Errores comunes y cómo evitarlos",
      category: "Técnicas",
      author: "María González",
      date: "18 Oct 2025",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=500&fit=crop",
      excerpt: "Los 10 errores más frecuentes en sonido directo y soluciones prácticas para cada uno.",
      featured: false
    },
    {
      id: 8,
      title: "Entrevista: Productora independiente 'Luz del Sur'",
      category: "Entrevistas",
      author: "Juan Pérez",
      date: "15 Oct 2025",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop",
      excerpt: "Hablamos con los fundadores sobre su trayectoria y proyectos en desarrollo.",
      featured: false
    },
    {
      id: 9,
      title: "Caso de éxito: Cortometraje 'La Espera'",
      category: "Proyectos",
      author: "Carlos Martínez",
      date: "12 Oct 2025",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=500&fit=crop",
      excerpt: "Cómo un pequeño equipo logró ganar en Mar del Plata con equipos Ala Norte.",
      featured: false
    }
  ];

  const popularArticles = articles.filter(a => a.featured).slice(0, 3);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "Todos" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl mb-6 tracking-tight">
              BLOG ALA NORTE
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Consejos técnicos, entrevistas, behind the scenes y todo lo que necesitás saber sobre producción audiovisual.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-muted sticky top-20 z-10 border-b-2 border-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (!selectedCategory && category === "Todos") ? "default" : "outline"}
                onClick={() => setSelectedCategory(category === "Todos" ? null : category)}
                className="font-heading"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Grid */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-3xl mb-8">
                {selectedCategory ? selectedCategory : "Artículos Recientes"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="border-2 border-foreground shadow-brutal overflow-hidden hover:shadow-brutal-lg transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border-2 border-foreground">
                        {article.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-heading text-lg line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                      <Button variant="outline" className="w-full font-heading group">
                        LEER MÁS
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredArticles.length === 0 && (
                <Card className="border-2 border-foreground shadow-brutal">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No encontramos artículos que coincidan con tu búsqueda.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Popular Articles */}
              <Card className="border-2 border-foreground shadow-brutal">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">ARTÍCULOS POPULARES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularArticles.map((article) => (
                    <div key={article.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Workshops */}
              <Card className="border-2 border-foreground shadow-brutal bg-muted/50">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">PRÓXIMOS TALLERES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Iluminación para Cine</h3>
                    <p className="text-xs text-muted-foreground">15 Dic 2025 • Presencial</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Workflow con RED</h3>
                    <p className="text-xs text-muted-foreground">22 Dic 2025 • Online</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4 font-heading" size="sm">
                    VER TALLERES
                  </Button>
                </CardContent>
              </Card>

              {/* Newsletter CTA */}
              <Card className="border-2 border-foreground shadow-brutal bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">SUSCRIBITE</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Recibí los mejores artículos en tu email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input 
                    type="email" 
                    placeholder="tu@email.com" 
                    className="mb-3 bg-background text-foreground"
                  />
                  <Button variant="secondary" className="w-full font-heading">
                    SUSCRIBIRME
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
