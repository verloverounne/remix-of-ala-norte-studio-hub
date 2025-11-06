import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  featured: boolean;
  created_at: string;
  category_id: string;
  author_id: string;
  slug: string;
  blog_categories: {
    name: string;
  };
  profiles: {
    display_name: string;
  };
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          *,
          blog_categories(name),
          profiles(display_name)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el artículo",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setArticle(data);

      if (data?.category_id) {
        const { data: related } = await supabase
          .from('blog_articles')
          .select(`
            *,
            blog_categories(name),
            profiles(display_name)
          `)
          .eq('category_id', data.category_id)
          .eq('published', true)
          .neq('id', data.id)
          .limit(3);

        if (related) setRelatedArticles(related);
      }

      setLoading(false);
    };

    fetchArticle();
  }, [slug, toast]);

  const shareUrl = window.location.href;
  const shareTitle = article?.title || "";

  const shareOnSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace se ha copiado al portapapeles"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="font-heading text-xl">Cargando...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <h1 className="font-heading text-4xl mb-4">Artículo no encontrado</h1>
        <Button asChild variant="outline">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <article className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al blog
          </Link>
        </Button>

        {article.image_url && (
          <div className="aspect-video w-full overflow-hidden border-2 border-foreground mb-8">
            <img 
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-6">
          <Badge className="mb-4 border-2 border-foreground">
            {article.blog_categories?.name}
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(article.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {article.profiles?.display_name || 'Ala Norte'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b-2 border-foreground">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="font-heading"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copiar enlace
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('facebook')}
            className="font-heading"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('twitter')}
            className="font-heading"
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => shareOnSocial('linkedin')}
            className="font-heading"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>
        </div>

        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-16 border-t-2 border-foreground">
            <h2 className="font-heading text-3xl mb-8">Artículos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link key={related.id} to={`/blog/${related.slug}`}>
                  <Card className="border-2 border-foreground hover:shadow-brutal transition-shadow h-full">
                    {related.image_url && (
                      <div className="aspect-video overflow-hidden border-b-2 border-foreground">
                        <img 
                          src={related.image_url}
                          alt={related.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <Badge className="mb-2 border border-foreground text-xs">
                        {related.blog_categories?.name}
                      </Badge>
                      <h3 className="font-heading text-lg mb-2 line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {related.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
