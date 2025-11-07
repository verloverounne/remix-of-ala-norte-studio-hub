import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Film, Video, Camera, Award, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";

const Comunidad = () => {
  const [federalProjectsApi, setFederalProjectsApi] = useState<CarouselApi>();
  const [currentFederalSlide, setCurrentFederalSlide] = useState(0);

  useEffect(() => {
    if (!federalProjectsApi) return;

    const updateSlide = () => {
      setCurrentFederalSlide(federalProjectsApi.selectedScrollSnap());
    };

    federalProjectsApi.on("select", updateSlide);
    updateSlide();

    return () => {
      federalProjectsApi.off("select", updateSlide);
    };
  }, [federalProjectsApi]);

  const federalProjects = [
    {
      title: "Largometraje 'Pampa Adentro'",
      region: "Santa Fe",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
      thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop",
      description: "Rodaje completo en Entre Ríos con equipos Ala Norte. Cámaras RED y luces LED."
    },
    {
      title: "Documental 'Camino al Sur'",
      region: "Patagonia",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=800&h=450&fit=crop",
      description: "12 días de filmación en Ushuaia. Soporte técnico remoto durante toda la producción."
    },
    {
      title: "Serie 'Viñedos del Oeste'",
      region: "Mendoza",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=450&fit=crop",
      description: "8 episodios filmados en bodegas mendocinas. Equipo completo de cine."
    },
    {
      title: "Publicidad 'Norte Argentino'",
      region: "Salta",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=450&fit=crop",
      description: "Campaña turística rodada en Cafayate con drones y cámaras 4K."
    },
    {
      title: "Cortometraje 'Mar del Plata'",
      region: "Buenos Aires",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop",
      description: "Ganador del Festival Internacional. Equipos y asesoría técnica Ala Norte."
    }
  ];

  const awards = [
    {
      title: "Premio Cóndor de Plata",
      year: "2024",
      category: "Mejor Equipo Técnico",
      project: "Película 'El Silencio'"
    },
    {
      title: "Festival de Mar del Plata",
      year: "2023",
      category: "Mejor Fotografía",
      project: "Cortometraje 'La Espera'"
    },
    {
      title: "Premio Sur",
      year: "2023",
      category: "Mejor Documental",
      project: "'Camino al Sur'"
    },
    {
      title: "Festival Internacional",
      year: "2022",
      category: "Mención Especial",
      project: "Serie 'Pampa Infinita'"
    }
  ];

  const testimonials = [
    {
      name: "Sofía Martínez",
      region: "Gran Buenos Aires",
      project: "Largometraje 'Montañas'",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      text: "Gracias a Ala Norte pudimos filmar en locaciones increíbles con el mejor equipo. El soporte fue impecable."
    },
    {
      name: "Tomás Ruiz",
      region: "Corrientes",
      project: "Serie 'Viñedos'",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      text: "La asesoría técnica fue clave para nuestra serie. Nos ayudaron a elegir las cámaras perfectas para exteriores."
    },
    {
      name: "Lucía Fernández",
      region: "Chaco",
      project: "Documental 'Al Sur'",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      text: "Filmar en la Patagonia con el respaldo de Ala Norte fue una experiencia única. Equipo de primer nivel."
    }
  ];

  const successCases = [
    {
      title: "Cortometraje 'La Espera'",
      category: "Ficción",
      region: "Mendoza",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
      description: "Ganador en Festival de Mar del Plata. Filmado completamente con equipos Ala Norte."
    },
    {
      title: "Publicidad Coca-Cola Argentina",
      category: "Publicidad",
      region: "Neuquén",
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
    <div className="min-h-screen pt-14 sm:pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight">
              DESDE EL NORTE HASTA EL SUR, JUNTOS HACEMOS CINE
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Somos una red federal de creadores audiovisuales. Conectamos talento, compartimos proyectos y construimos la industria del futuro.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              ⚠️ Contenido simulado para demostración. Prototipo funcional de frontend y backend.
            </p>
          </div>
        </div>
      </section>

      {/* Federal Projects Video Slider */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12 text-center">
            PROYECTOS FEDERALES
          </h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto text-base sm:text-lg">
            Desde la Patagonia hasta el Norte, hemos sido parte de producciones que recorren todo el país. 
            Mirá algunos de los proyectos en los que participamos.
          </p>
          
          <div className="relative">
            <Carousel 
              className="w-full max-w-5xl mx-auto"
              setApi={setFederalProjectsApi}
              opts={{ loop: true }}
            >
              <CarouselContent>
                {federalProjects.map((project, index) => (
                  <CarouselItem key={index} className="md:basis-1/2">
                    <Card className="border-2 border-foreground shadow-brutal overflow-hidden">
                      <div className="relative aspect-video bg-muted">
                        <img 
                          src={project.thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 hover:bg-foreground/40 transition-colors cursor-pointer">
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-brutal-sm">
                            <Video className="h-8 w-8 text-primary-foreground ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border-2 border-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {project.region}
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="font-heading text-lg">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Dot Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {federalProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => federalProjectsApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentFederalSlide === index ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Ir al proyecto ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials by Region */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-8 text-center">
            TESTIMONIOS DE LA COMUNIDAD
          </h2>
          <p className="text-xs text-muted-foreground/60 text-center mb-8">
            ⚠️ Contenido simulado. Prototipo funcional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
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
          <h2 className="font-heading text-3xl md:text-4xl mb-4 text-center">
            CASOS DE ÉXITO DESTACADOS
          </h2>
          <p className="text-xs text-muted-foreground/60 text-center mb-12">
            ⚠️ Contenido simulado. Prototipo funcional.
          </p>
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
          <h2 className="font-heading text-3xl md:text-4xl mb-4 text-center">
            DEL BLOG
          </h2>
          <p className="text-xs text-muted-foreground/60 text-center mb-12">
            ⚠️ Contenido simulado. Prototipo funcional.
          </p>
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

      {/* Awards and Recognition Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Trophy className="h-10 w-10 text-primary" />
            <h2 className="font-heading text-3xl md:text-4xl text-center">
              PREMIOS Y DISTINCIONES
            </h2>
          </div>
          <p className="text-center text-muted-foreground mb-4 max-w-3xl mx-auto text-lg">
            Orgullosos de ser parte de proyectos galardonados en festivales nacionales e internacionales.
          </p>
          <p className="text-xs text-muted-foreground/60 text-center mb-12">
            ⚠️ Contenido simulado. Prototipo funcional.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {awards.map((award, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center border-4 border-foreground shadow-brutal-sm">
                      <Award className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <CardTitle className="font-heading text-lg text-center">{award.title}</CardTitle>
                  <CardDescription className="text-center">
                    <span className="text-primary font-bold">{award.year}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-2">{award.category}</Badge>
                  <p className="text-sm text-muted-foreground">{award.project}</p>
                </CardContent>
              </Card>
            ))}
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
