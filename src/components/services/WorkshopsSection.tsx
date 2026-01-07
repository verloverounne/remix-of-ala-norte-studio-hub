import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface Workshop {
  title: string;
  date: string;
  duration: string;
  modality: string;
  buttonLabel: string;
  buttonVariant?: "default" | "outline";
}

const upcomingWorkshops: Workshop[] = [
  {
    title: "Iluminación para Cine",
    date: "15 de Diciembre, 2025",
    duration: "4 horas",
    modality: "Presencial",
    buttonLabel: "INSCRIBIRSE",
  },
  {
    title: "Workflow con Cámaras RED",
    date: "22 de Diciembre, 2025",
    duration: "3 horas",
    modality: "Online",
    buttonLabel: "INSCRIBIRSE",
  },
  {
    title: "Sonido Directo Profesional",
    date: "10 de Enero, 2026",
    duration: "5 horas",
    modality: "Presencial",
    buttonLabel: "INSCRIBIRSE",
  },
];

const pastWorkshops: Workshop[] = [
  {
    title: "Iluminación para Cine",
    date: "15 de Diciembre, 2025",
    duration: "4 horas",
    modality: "Presencial",
    buttonLabel: "VER REGISTRO",
    buttonVariant: "outline",
  },
  {
    title: "Workflow con Cámaras RED",
    date: "22 de Diciembre, 2025",
    duration: "3 horas",
    modality: "Online",
    buttonLabel: "VER REGISTRO",
    buttonVariant: "outline",
  },
  {
    title: "Sonido Directo Profesional",
    date: "10 de Enero, 2026",
    duration: "5 horas",
    modality: "Presencial",
    buttonLabel: "VER REGISTRO",
    buttonVariant: "outline",
  },
];

const WorkshopCard = ({ workshop }: { workshop: Workshop }) => (
  <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow">
    <CardContent className="p-6 space-y-4">
      <h4 className="font-heading text-xl font-bold text-foreground">
        {workshop.title}
      </h4>
      <div className="space-y-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{workshop.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{workshop.duration} • {workshop.modality}</span>
        </div>
      </div>
      <Button 
        variant={workshop.buttonVariant || "default"} 
        className="w-full mt-4"
      >
        {workshop.buttonLabel}
      </Button>
    </CardContent>
  </Card>
);

export const WorkshopsSection = () => {
  return (
    <section className="py-16 lg:py-24 px-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Próximos Talleres */}
        <div className="space-y-8">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
            PRÓXIMOS TALLERES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingWorkshops.map((workshop, index) => (
              <WorkshopCard key={`upcoming-${index}`} workshop={workshop} />
            ))}
          </div>
        </div>

        {/* Talleres Realizados */}
        <div className="space-y-8">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
            TALLERES REALIZADOS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastWorkshops.map((workshop, index) => (
              <WorkshopCard key={`past-${index}`} workshop={workshop} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
