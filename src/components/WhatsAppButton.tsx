import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5493624907592"; // Número de WhatsApp de Ala Norte
    const message = encodeURIComponent("Hola, me gustaría obtener más información sobre sus servicios.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-24 w-24 rounded-none shadow-2xl hover:scale-110 transition-transform bg-[#25D366] hover:bg-[#128C7E] text-white font-black"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};
