import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { WorkshopsSection } from "@/components/services/WorkshopsSection";
import { TestimonialsSection } from "@/components/services/TestimonialsSection";
import { ServicesCTASection } from "@/components/services/ServicesCTASection";
import { STATIC_HOME_SERVICES } from "@/data/servicesData";
import { cn } from "@/lib/utils";

interface HomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  hero_media_type?: string | null;
  hero_video_url?: string | null;
  bullets: string[];
  cta_label: string | null;
  cta_url: string | null;
  slug: string | null;
  order_index: number;
  is_active: boolean;
}

const Servicios = () => {
  const services: HomeService[] = STATIC_HOME_SERVICES;
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (services.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    panelRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [services]);

  if (services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-sans font-thin text-2xl mb-4">No hay servicios configurados</h1>
          <p className="text-muted-foreground">Agregá servicios desde el panel de administración.</p>
        </div>
      </div>
    );
  }

  const activeService = services[activeIndex];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Servicios de producción audiovisual y sala de sonido | Ala Norte"
        description="Producción audiovisual integral, postproducción, sala de sonido y workshops. Equipo técnico con asesoramiento dedicado en Buenos Aires."
        path="/servicios"
      />

      {/* Split hero: sticky media left, scrollable content right */}
      <section className="relative grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT: sticky media */}
        <div className="relative lg:sticky lg:top-0 lg:h-screen h-[50vh] overflow-hidden order-1">
          {services.map((service, idx) => {
            const isActive = idx === activeIndex;
            const mediaUrl =
              service.hero_media_type === "video" && service.hero_video_url
                ? service.hero_video_url
                : null;
            const imageUrl = service.hero_image_url || service.image_url || "";
            return (
              <div
                key={service.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 duotone-hover-group",
                  isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {mediaUrl ? (
                  <video
                    src={mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover video-duotone"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover image-duotone"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/90 to-primary/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
              </div>
            );
          })}

          {/* Slide indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {services.map((_, idx) => (
              <button
                key={idx}
                onClick={() => panelRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === activeIndex ? "w-12 bg-primary" : "w-2 bg-background/50 hover:bg-background/80"
                )}
                aria-label={`Ir a ${services[idx].title}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: scrollable service panels */}
        <div className="order-2">
          {services.map((service, idx) => (
            <article
              key={service.id}
              ref={(el) => (panelRefs.current[idx] = el)}
              data-index={idx}
              id={service.slug || service.id}
              className="min-h-screen flex items-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24 border-b border-border/20"
            >
              <div className="max-w-xl space-y-6">
                <span className="font-sans text-sm text-muted-foreground uppercase tracking-wider">
                  Servicio {String(idx + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </span>
                <h2
                  className="font-sans font-thin uppercase text-foreground"
                  style={{ fontSize: "clamp(2.25rem, 4.5vw, 4rem)" }}
                >
                  {service.title}
                </h2>
                {service.description && (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                )}
                {service.bullets && service.bullets.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {service.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                        <span className="text-primary mt-1">—</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {service.cta_label && service.cta_url && (
                  <div className="pt-4">
                    <Button asChild size="lg" className="rounded-sm uppercase">
                      <Link to={service.cta_url}>
                        {service.cta_label} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Final sections */}
      <WorkshopsSection />
      <TestimonialsSection />
      <ServicesCTASection />
    </div>
  );
};

export default Servicios;
