import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface Testimonial {
  name: string;
  project: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Martín Rodríguez",
    project: "Cortometraje 'El Silencio'",
    quote: "El soporte técnico fue increíble. Nos resolvieron un problema de última hora y pudimos terminar el rodaje sin contratiempos.",
  },
  {
    name: "Laura García",
    project: "Publicidad Nacional",
    quote: "Los combos personalizados nos ahorraron tiempo y dinero. El equipo llegó perfecto y configurado para nuestras necesidades.",
  },
  {
    name: "Diego Fernández",
    project: "Serie Web",
    quote: "Los talleres son excelentes. Aprendí a usar el equipo de forma profesional antes del rodaje. Super recomendable.",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 lg:py-24 px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
          TESTIMONIOS DE SERVICIOS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <Quote className="w-8 h-8 text-primary opacity-50" />
                <p className="text-muted-foreground italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="font-heading font-bold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.project}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
