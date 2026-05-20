import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const ServicesCTASection = () => {
  const whatsappNumber = "+54 11 4718-0732";
  const whatsappMessage = encodeURIComponent("Hola, necesito información sobre un servicio específico.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="py-16 lg:py-24 px-8 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="font-sans font-thin uppercase" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>¿NECESITÁS UN SERVICIO ESPECÍFICO?</h2>
        <p className="text-lg opacity-90">
          Cada producción es única. Contanos qué necesitás y armamos una solución a tu medida.
        </p>
        <Button variant="secondary" size="lg" className="mt-4 rounded-sm" onClick={() => window.open(whatsappUrl, "_blank")}>
          <MessageCircle className="w-5 h-5 mr-2" />
          CONTACTANOS
        </Button>
      </div>
    </section>
  );
};
