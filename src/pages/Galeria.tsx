import { useState, useEffect } from "react";
import { MapPin, Ruler, Calendar } from "lucide-react";
import planoIlustrativo from "@/assets/plano-ilustrativo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Space } from "@/types/supabase";
import Viewer360 from "@/components/Viewer360";
import { GalleryHero } from "@/components/GalleryHero";
import { ProductionsSlider } from "@/components/ProductionsSlider";
import { useGalleryImages } from "@/hooks/useGalleryImages";
const Galeria = () => {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const { getByPageType, loading: galleryLoading } = useGalleryImages();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);

    // Fetch space data
    const { data: spaceData } = await supabase.from("spaces").select("*").eq("slug", "galeria").single();
    if (spaceData) {
      setSpace({
        ...spaceData,
        images: Array.isArray(spaceData.images) ? (spaceData.images as string[]) : [],
        features: Array.isArray(spaceData.features) ? (spaceData.features as string[]) : [],
        included_items: Array.isArray(spaceData.included_items) ? (spaceData.included_items as string[]) : [],
        optional_services: Array.isArray(spaceData.optional_services) ? (spaceData.optional_services as string[]) : [],
        amenities: Array.isArray(spaceData.amenities) ? (spaceData.amenities as any[]) : [],
        specs: spaceData.specs || {},
      } as Space);
    }
    setLoading(false);
  };

  // Get featured image from gallery images
  const galeriaImages = getByPageType("galeria");
  const featuredMediaImage = galeriaImages[0]?.image_url || null;
  if (loading || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section with 2 Column Layout */}
      <GalleryHero space={space} />

      {/* Details Section with Featured Image */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: Featured Image + Floor Plan */}
            <div className="space-y-6">
              {/* Featured Image from Media panel */}
              <div className="relative aspect-video lg:aspect-square overflow-hidden rounded-lg border border-foreground shadow-brutal">
                <img
                  src={
                    featuredMediaImage ||
                    space.featured_image ||
                    (space.images && space.images[0]) ||
                    "/placeholder.svg"
                  }
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floor Plan - Only visible on desktop */}
              <div className="hidden lg:block relative overflow-hidden rounded-lg border border-foreground shadow-brutal">
                <img
                  src={planoIlustrativo}
                  alt="Plano ilustrativo del estudio"
                  className="w-full h-auto object-contain bg-background"
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
                <div className="bg-muted p-4 rounded-lg ">
                  <h3 className="font-heading font-bold mb-2">Plano de la galería </h3>
                  <p className="text-sm text-muted-foreground font-heading">{space.layout_description}</p>
                </div>
              )}

              {/* Floor Plan - Mobile only */}
              <div className="lg:hidden relative overflow-hidden rounded-lg border border-foreground shadow-brutal">
                <img
                  src={planoIlustrativo}
                  alt="Plano ilustrativo del estudio"
                  className="w-full h-auto object-contain bg-background"
                />
              </div>
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
                    INCLUIDO EN EL BLOQUE Incluido sin cargo adicional
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
      {/* 360° Virtual Tour Section - Movido debajo de características */}
      {space.tour_360_url && (
        <section className="py-12 sm:py-16 bg-foreground">
          <div className="w-full px-0">
            <div className="container mx-auto px-4 mb-8">
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-4">
                  Ya conocés la galería ALA NORTE?
                </h2>
                <p className="text-muted-foreground font-heading text-lg ">
                  Explorá la galería antes de tu reserva. Arrastrá para moverte y conocer cada rincón del espacio.
                </p>
              </div>
            </div>
            <div className="w-full">
              <Viewer360 imageSrc={space.tour_360_url} height="1000px" />
            </div>
          </div>
        </section>
      )}
      {/* Productions Slider */}
      <ProductionsSlider />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4 text-center">
            ¿Querés reservar la galería?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto font-heading leading-tight text-center">
            Hablemos de tu proyecto. Te contamos disponibilidad, armamos una propuesta a medida y coordinamos todo para
            que llegues tranquilo al rodaje.
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
export default Galeria;
