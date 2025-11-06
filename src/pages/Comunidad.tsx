import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Film, Video, Camera } from "lucide-react";
import { Link } from "react-router-dom";

const Comunidad = () => {
  const regions = [
    { name: "Buenos Aires", projects: 47, color: "bg-blue-500" },
    { name: "Córdoba", projects: 23, color: "bg-green-500" },
    { name: "Mendoza", projects: 18, color: "bg-yellow-500" },
    { name: "Santa Fe", projects: 15, color: "bg-red-500" },
    { name: "Patagonia", projects: 12, color: "bg-purple-500" },
    { name: "Norte", projects: 9, color: "bg-orange-500" }
  ];

  const testimonials = [
    {
      name: "Sofía Martínez",
      region: "Córdoba",
      project: "Largometraje 'Montañas'",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      text: "Gracias a Ala Norte pudimos filmar en locaciones increíbles con el mejor equipo. El soporte fue impecable."
    },
    {
      name: "Tomás Ruiz",
      region: "Mendoza",
      project: "Serie 'Viñedos'",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      text: "La asesoría técnica fue clave para nuestra serie. Nos ayudaron a elegir las cámaras perfectas para exteriores."
    },
    {
      name: "Lucía Fernández",
      region: "Patagonia",
      project: "Documental 'Al Sur'",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      text: "Filmar en la Patagonia con el respaldo de Ala Norte fue una experiencia única. Equipo de primer nivel."
    }
  ];

  const successCases = [
    {
      title: "Cortometraje 'La Espera'",
      category: "Ficción",
      region: "Buenos Aires",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
      description: "Ganador en Festival de Mar del Plata. Filmado completamente con equipos Ala Norte."
    },
    {
      title: "Publicidad Coca-Cola Argentina",
      category: "Publicidad",
      region: "Córdoba",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=500&fit=crop",
      description: "Campaña nacional filmada en 4K. Luces LED y cámaras de cine."
    },
    {
      title: "Serie 'Pampa Infinita'",
      category: "Serie",
      region: "Santa Fe",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
      description: "8 episodios para plataforma. Equipos y soporte técnico durante 3 meses."
    }
  ];

  const blogPosts = [
    {
      title: "Cómo elegir la cámara para tu próximo proyecto",
      category: "Equipos",
      date: "10 Nov 2025",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=400&fit=crop"
    },
    {
      title: "Entrevista: Directores de Fotografía Argentinos",
      category: "Entrevistas",
      date: "5 Nov 2025",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop"
    },
    {
      title: "Behind the Scenes: Rodaje en Bariloche",
      category: "Proyectos",
      date: "1 Nov 2025",
      image: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=600&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl mb-6 tracking-tight">
              DESDE EL NORTE HASTA EL SUR, JUNTOS HACEMOS CINE
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Somos una red federal de creadores audiovisuales. Conectamos talento, compartimos proyectos y construimos la industria del futuro.
            </p>
          </div>
        </div>
      </section>

      {/* Map of Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            PROYECTOS POR REGIÓN
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {regions.map((region, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal text-center">
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-2">
                    <div className={`w-12 h-12 ${region.color} rounded-full flex items-center justify-center`}>
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="font-heading text-lg">{region.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{region.projects}</p>
                  <p className="text-sm text-muted-foreground">proyectos</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials by Region */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            TESTIMONIOS DE LA COMUNIDAD
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-2 border-foreground object-cover"
                    />
                    <div>
                      <CardTitle className="font-heading text-lg">{testimonial.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.region}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">{testimonial.project}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Cases */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            CASOS DE ÉXITO DESTACADOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {successCases.map((project, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/90 text-foreground border-2 border-foreground">
                      {project.category === "Ficción" && <Film className="h-3 w-3 mr-1" />}
                      {project.category === "Publicidad" && <Video className="h-3 w-3 mr-1" />}
                      {project.category === "Serie" && <Camera className="h-3 w-3 mr-1" />}
                      {project.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{project.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {project.region}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            DEL BLOG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal overflow-hidden hover:shadow-brutal-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="font-heading text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full font-heading" asChild>
                    <Link to="/blog">LEER MÁS</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild size="lg" className="font-heading">
              <Link to="/blog">VER TODO EL BLOG</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl mb-6">
              COMPARTÍ TU PROYECTO CON NOSOTROS
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              ¿Hiciste algo increíble con nuestro equipo? Queremos conocer tu historia y compartirla con la comunidad.
            </p>
            <Button asChild size="lg" className="font-heading">
              <Link to="/contacto">CONTANOS TU HISTORIA</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Comunidad;
