import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
interface ServiceSectionProps {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  bullets: string[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  imageUrl?: string | null;
  index: number;
}
export const ServiceSection = forwardRef<HTMLElement, ServiceSectionProps>(
  ({ id, slug, title, description, bullets, ctaLabel, ctaUrl, imageUrl, index }, ref) => {
    const isEven = index % 2 === 0;
    return (
      <section
        ref={ref}
        id={slug || id}
        className="min-h-[60vh] md:min-h-[70vh] flex items-center relative z-10 bg-background"
        style={{
          scrollMarginTop: "calc(40vh + 100px)",
        }}
      >
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${isEven ? "" : "md:grid-flow-dense"}`}
          >
            {/* Text content */}
            <div className={`space-y-6 pb-8 flex flex-col justify-center ${isEven ? "" : "md:col-start-2"}`}>
              <div className="space-y-4">
                <span className="font-heading text-sm text-muted-foreground uppercase tracking-wider">
                  Servicio {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase">{title}</h2>
              </div>

              {description && <p className="text-sm sm:text-base text-muted-foreground leading-tight">{description}</p>}

              {bullets && bullets.length > 0 && (
                <ul className="space-y-3">
                  {bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {ctaLabel && ctaUrl && (
                <div className="pt-4">
                  <Button asChild size="lg" className="font-heading uppercase">
                    <Link to={ctaUrl}>{ctaLabel}</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Image */}
            <div className={`${isEven ? "" : "md:col-start-1 md:row-start-1"}`}>
              <div className="h-screen overflow-hidden relative duotone-hover-group">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover image-duotone" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="font-heading text-muted-foreground uppercase">{title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
ServiceSection.displayName = "ServiceSection";
export default ServiceSection;
