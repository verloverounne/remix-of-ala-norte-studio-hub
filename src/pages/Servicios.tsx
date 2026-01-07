import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ServicesHeroSlider } from "@/components/services/ServicesHeroSlider";
import { ServiceSection } from "@/components/services/ServiceSection";
import { WorkshopsSection } from "@/components/services/WorkshopsSection";
import { TestimonialsSection } from "@/components/services/TestimonialsSection";
import { ServicesCTASection } from "@/components/services/ServicesCTASection";
import type { Json } from "@/integrations/supabase/types";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  bullets: string[];
  cta_label: string | null;
  cta_url: string | null;
  slug: string | null;
  order_index: number;
  is_active: boolean;
}

const parseBullets = (bullets: Json | null): string[] => {
  if (!bullets) return [];
  if (Array.isArray(bullets)) {
    return bullets.filter((b): b is string => typeof b === 'string');
  }
  return [];
};

const Servicios = () => {
  const [services, setServices] = useState<HomeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("home_services")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (!error && data) {
        const parsedServices: HomeService[] = data.map(service => ({
          id: service.id,
          title: service.title,
          description: service.description,
          image_url: service.image_url,
          hero_image_url: service.hero_image_url,
          bullets: parseBullets(service.bullets),
          cta_label: service.cta_label,
          cta_url: service.cta_url,
          slug: service.slug,
          order_index: service.order_index ?? 0,
          is_active: service.is_active ?? true,
        }));
        setServices(parsedServices);
        if (parsedServices.length > 0) {
          setActiveServiceId(parsedServices[0].id);
        }
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  // Track if scroll is triggered by click (to avoid fighting with IntersectionObserver)
  const isScrollingFromClick = useRef(false);

  // IntersectionObserver to update active tab on scroll
  useEffect(() => {
    if (services.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Don't update if user just clicked a tab
        if (isScrollingFromClick.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const serviceId = entry.target.getAttribute("data-service-id");
            if (serviceId) {
              setActiveServiceId(serviceId);
            }
          }
        });
      },
      {
        // Trigger when section reaches the top (below sticky hero)
        rootMargin: "-200px 0px -60% 0px",
        threshold: 0
      }
    );

    sectionRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [services]);

  const handleServiceChange = useCallback((serviceId: string | null) => {
    if (!serviceId) return;
    
    // Mark that we're scrolling from a click
    isScrollingFromClick.current = true;
    setActiveServiceId(serviceId);
    
    // Scroll to the corresponding section
    const element = sectionRefs.current.get(serviceId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Reset the flag after scroll animation completes
    setTimeout(() => {
      isScrollingFromClick.current = false;
    }, 1000);
  }, []);

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    if (el) {
      el.setAttribute("data-service-id", id);
      sectionRefs.current.set(id, el);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-heading text-muted-foreground">CARGANDO SERVICIOS...</div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl mb-4">No hay servicios configurados</h1>
          <p className="text-muted-foreground">Agregá servicios desde el panel de administración.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ServicesHeroSlider 
        services={services}
        activeServiceId={activeServiceId}
        onServiceChange={handleServiceChange}
      />

      {/* Vertical stacked service sections */}
      <div className="bg-background">
        {services.map((service, index) => (
          <ServiceSection
            key={service.id}
            ref={setSectionRef(service.id)}
            id={service.id}
            slug={service.slug}
            title={service.title}
            description={service.description}
            bullets={service.bullets || []}
            ctaLabel={service.cta_label}
            ctaUrl={service.cta_url}
            imageUrl={service.image_url}
            index={index}
          />
        ))}
      </div>

      {/* Final sections */}
      <WorkshopsSection />
      <TestimonialsSection />
      <ServicesCTASection />
    </div>
  );
};

export default Servicios;
