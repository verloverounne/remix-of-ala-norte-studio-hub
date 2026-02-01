import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Viewer360 from "@/components/Viewer360";
import { GalleryHero } from "@/components/GalleryHero";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { SALA_GRABACION_SPACE } from "@/data/spaces";

const SalaGrabacion = () => {
  const space = SALA_GRABACION_SPACE;
  const { getByPageType } = useGalleryImages();

  // Get featured image from gallery images
  const salaImages = getByPageType("sala-grabacion");
  const featuredMediaImage = salaImages[0]?.image_url || null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <GalleryHero space={space} />

      {/* Details Section with Featured Image */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: Featured Image */}
            <div className="space-y-6">
              {/* Featured Image from Media panel */}
              <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-lg">
                <img
                  src={featuredMediaImage || space.featured_image || (space.images && space.images[0]) || "/placeholder.svg"}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">El espacio</h2>
                <p className="text-muted-foreground font-heading text-base font-medium">
                  {space.detailed_description || space.description}
                </p>
              </div>

              {/* Layout Description */}
              {space.layout_description && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-heading font-bold mb-2">Distribución del espacio</h3>
                  <p className="text-sm text-muted-foreground font-heading">{space.layout_description}</p>
                </div>
              )}

              {/* Features - 2 columns */}
              {space.features && Array.isArray(space.features) && space.features.length > 0 && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-[48px]">
                  {(space.features as string[]).map((feature, index) => (
                    <p key={index} className="text-sm text-muted-foreground font-heading flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </p>
                  ))}
                </div>
              )}

              {/* Included Items */}
              {space.included_items && space.included_items.length > 0 && (
                <div>
                  <h3 className="text-xl font-heading font-bold mb-3 flex items-center gap-2">
                    Incluido sin cargo adicional
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {space.included_items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">•</span>
                        <span className="font-heading">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Schedule Info */}
              <div className="border-foreground p-4 rounded-lg bg-stone-200 border-0">
                <h3 className="font-heading font-bold mb-2 flex items-center gap-2">HORARIOS</h3>
                <p className="text-sm text-muted-foreground font-heading">{space.schedule_weekday}</p>
                <p className="text-sm text-muted-foreground font-heading">{space.schedule_weekend}</p>
              </div>

              {/* Optional Services */}
              {space.optional_services && space.optional_services.length > 0 && (
                <div>
                  <h3 className="text-xl font-heading font-bold mb-3">Servicios adicionales</h3>
                  <div className="flex flex-wrap gap-2">
                    {space.optional_services.map((service, index) => (
                      <Badge key={index} variant="outline" className="font-heading">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="hero" size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contacto">
                  <Calendar className="mr-2 h-5 w-5" />
                  {space.cta_text || "RESERVAR BLOQUE"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 360° Virtual Tour Section */}
      <section className="py-12 sm:py-16 bg-foreground">
        <div className="w-full px-0">
          <div className="container mx-auto px-4 mb-8">
            <div className="text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
                Ya conocés la sala de grabación?
              </h2>
              <p className="text-muted-foreground font-heading text-lg">
                Explorá la sala antes de tu reserva. Arrastrá para moverte y conocer cada rincón del espacio.
              </p>
            </div>
          </div>
          <div className="w-full">
            <Viewer360
              imageSrc="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//36-1%203.JPG"
              secondImageSrc="https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//363.jpg"
              height="700px"
              mobileHeight="60vh"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4 text-center">
            ¿Querés reservar la sala?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-heading leading-tight text-center">
            Hablemos de tu proyecto. Te contamos disponibilidad, armamos una propuesta a medida y coordinamos todo para
            que llegues tranquilo a la sesión.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/contacto">
              <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              CONTACTAR
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SalaGrabacion;
