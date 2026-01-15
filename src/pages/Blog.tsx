import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image_url: string;
  featured: boolean;
  created_at: string;
  blog_categories: {
    name: string;
  };
  profiles: {
    display_name: string;
  };
}

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [categoriesRes, articlesRes] = await Promise.all([
      supabase.from('blog_categories').select('*').order('name'),
      supabase
        .from('blog_articles')
        .select(`
          *,
          blog_categories(name),
          profiles(display_name)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (articlesRes.data) setArticles(articlesRes.data);
    setLoading(false);
  };

  const popularArticles = articles.filter(a => a.featured).slice(0, 3);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.blog_categories?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="font-heading text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-background">
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
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="font-heading"
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                className="font-heading"
              >
                {category.name}
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
                  <Link key={article.id} to={`/blog/${article.slug}`}>
                    <Card className="border-2 border-foreground shadow-brutal overflow-hidden hover:shadow-brutal-lg transition-shadow h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border-2 border-foreground">
                          {article.blog_categories?.name}
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="font-heading text-lg line-clamp-2">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.created_at).toLocaleDateString('es-AR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.profiles?.display_name || 'Ala Norte'}
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
                  </Link>
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
                    <Link key={article.id} to={`/blog/${article.slug}`}>
                      <div className="pb-4 border-b border-border last:border-0 last:pb-0 hover:bg-muted/50 p-2 -m-2 rounded transition-colors">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(article.created_at).toLocaleDateString('es-AR')}</span>
                        </div>
                      </div>
                    </Link>
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
