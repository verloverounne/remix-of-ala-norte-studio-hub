import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "54114780732";
    const message = encodeURIComponent("Hola, me gustaría obtener más información sobre sus servicios.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };
  return <Button onClick={handleWhatsAppClick} size="icon" className="fixed bottom-6 right-6 z-50 h-10 w-10  shadow-2xl hover:scale-110 transition-transform bg-[#25D366] hover:bg-[#128C7E] text-white" aria-label="Contactar por WhatsApp">
      <MessageCircle className="h-6 w-6" />
    </Button>;
};