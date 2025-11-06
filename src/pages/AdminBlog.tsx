import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: string;
  featured: boolean;
  published: boolean;
  created_at: string;
  blog_categories: {
    name: string;
  };
}

const AdminBlog = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category_id: "",
    featured: false,
    published: false
  });
  const { toast } = useToast();

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('blog_articles')
      .select(`
        *,
        blog_categories(name)
      `)
      .order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSave = async () => {
    if (!currentArticle.title || !currentArticle.content || !currentArticle.category_id) {
      toast({
        title: "Error",
        description: "Título, contenido y categoría son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const slug = currentArticle.slug || generateSlug(currentArticle.title);
    const { data: { user } } = await supabase.auth.getUser();

    const articleData = {
      title: currentArticle.title,
      slug,
      excerpt: currentArticle.excerpt || "",
      content: currentArticle.content,
      image_url: currentArticle.image_url || "",
      category_id: currentArticle.category_id,
      author_id: user?.id,
      featured: currentArticle.featured || false,
      published: currentArticle.published || false
    };

    if (currentArticle.id) {
      const { error } = await supabase
        .from('blog_articles')
        .update(articleData)
        .eq('id', currentArticle.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('blog_articles')
        .insert([articleData]);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    }

    toast({
      title: "Éxito",
      description: "Artículo guardado correctamente"
    });

    resetForm();
    fetchArticles();
  };

  const handleEdit = (article: Article) => {
    setCurrentArticle(article);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este artículo?")) return;

    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Éxito",
      description: "Artículo eliminado"
    });

    fetchArticles();
  };

  const togglePublished = async (article: Article) => {
    const { error } = await supabase
      .from('blog_articles')
      .update({ published: !article.published })
      .eq('id', article.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    fetchArticles();
  };

  const resetForm = () => {
    setCurrentArticle({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      category_id: "",
      featured: false,
      published: false
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-heading text-4xl mb-2">Gestión del Blog</h1>
          <p className="text-muted-foreground">
            Crea y administra artículos del blog
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-2 border-foreground">
              <CardHeader>
                <CardTitle className="font-heading">
                  {isEditing ? "Editar artículo" : "Nuevo artículo"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={currentArticle.title}
                    onChange={(e) => {
                      setCurrentArticle({
                        ...currentArticle,
                        title: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    placeholder="Título del artículo"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={currentArticle.slug}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, slug: e.target.value })}
                    placeholder="titulo-del-articulo"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={currentArticle.category_id}
                    onValueChange={(value) => setCurrentArticle({ ...currentArticle, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="excerpt">Extracto</Label>
                  <Textarea
                    id="excerpt"
                    value={currentArticle.excerpt}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                    placeholder="Breve descripción del artículo"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image">URL de imagen</Label>
                  <Input
                    id="image"
                    value={currentArticle.image_url}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label>Contenido</Label>
                  <div className="border-2 border-foreground rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={currentArticle.content}
                      onChange={(content) => setCurrentArticle({ ...currentArticle, content })}
                      modules={modules}
                      className="min-h-[300px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t-2 border-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={currentArticle.featured}
                        onCheckedChange={(checked) => setCurrentArticle({ ...currentArticle, featured: checked })}
                      />
                      <Label>Destacado</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={currentArticle.published}
                        onCheckedChange={(checked) => setCurrentArticle({ ...currentArticle, published: checked })}
                      />
                      <Label>Publicado</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="font-heading">
                    <Plus className="h-4 w-4 mr-2" />
                    {isEditing ? "Actualizar" : "Crear"} artículo
                  </Button>
                  {isEditing && (
                    <Button onClick={resetForm} variant="outline" className="font-heading">
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-2 border-foreground">
              <CardHeader>
                <CardTitle className="font-heading">Artículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-3 border border-foreground rounded-md"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-heading text-sm line-clamp-2">
                          {article.title}
                        </h3>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePublished(article)}
                            className="h-8 w-8 p-0"
                          >
                            {article.published ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(article)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(article.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {article.blog_categories?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
