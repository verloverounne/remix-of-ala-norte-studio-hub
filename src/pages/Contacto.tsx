import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map.tsx";
import { useGalleryImages } from "@/hooks/useGalleryImages";

const Contacto = () => {
  const { toast } = useToast();
  const { getByPageType } = useGalleryImages();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const contactoMedia = getByPageType("contacto");
  const contactVideo = contactoMedia[0]?.media_type === "video" ? contactoMedia[0]?.image_url : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Ups",
        description: "Algo no funcionó. Verificá los datos e intentá de nuevo.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "¡Listo!",
      description: "Tu consulta fue enviada. Te vamos a responder lo antes posible."
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section — full-width like Home */}
      <section className="relative border-b border-border bg-foreground text-background overflow-hidden">
        <div className="py-20 sm:py-28 lg:py-32">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <h1
              className="font-sans font-thin uppercase"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              HABLEMOS
            </h1>
            <p className="max-w-3xl text-left font-medium text-sm sm:text-base md:text-lg mt-4 text-background/80">
              Contanos tu idea, tus fechas y qué necesitás. Armamos juntos una propuesta de equipamiento y espacios a medida. Nuestro equipo te responde con asesoramiento técnico dedicado.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form + Info — content section */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column: Form + Map */}
            <div className="space-y-0">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl py-4 font-heading uppercase">ENVIANOS UN MENSAJE</CardTitle>
                  <p className="text-sm text-muted-foreground">Completá el formulario y te respondemos a la brevedad</p>
                </CardHeader>
                <CardContent className="bg-card p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tu nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Tu mail de contacto <span className="text-destructive">*</span>
                      </Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+54 11 1234-5678" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        ¿Qué equipo tenés en mente o qué necesitás? <span className="text-destructive">*</span>
                      </Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Contanos brevemente de qué se trata tu proyecto..." rows={6} required />
                    </div>
                    <Button type="submit" variant="hero" size="lg" className="w-full">
                      Enviar Mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map */}
              <div className="h-[400px] overflow-hidden">
                <Map address="V. S. de Liniers 1565, Vicente López, Buenos Aires, Argentina" latitude={-34.527} longitude={-58.475} />
              </div>
            </div>

            {/* Right column: Video + Info + Social */}
            <div className="space-y-6">
              {contactVideo && (
                <div className="aspect-[9/16] w-full overflow-hidden bg-muted">
                  <video src={contactVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>
              )}

              <Card className="border border-foreground/10">
                <CardHeader>
                  <CardTitle className="font-heading uppercase">Información de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Dirección</p>
                      <p className="text-muted-foreground">V. S. de Liniers 1565<br />Vicente López, Buenos Aires<br />Argentina</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Teléfono</p>
                      <p className="text-muted-foreground">+54 (11) 4718-0732</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-muted-foreground">info@alanortecinedigital.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Horarios</p>
                      <p className="text-muted-foreground">Lunes a Viernes: 9:00 - 19:00</p>
                      <p className="text-muted-foreground">Sábados: 10:00 - 15:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-foreground/10">
                <CardHeader>
                  <CardTitle className="font-heading uppercase">Seguinos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <a href="https://www.facebook.com/alanortecinedigital" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-foreground hover:bg-primary flex items-center justify-center transition-all hover:-translate-y-0.5" aria-label="Facebook">
                      <Facebook className="h-5 w-5 text-background" />
                    </a>
                    <a href="https://www.instagram.com/alanortecinedigital/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-foreground hover:bg-primary flex items-center justify-center transition-all hover:-translate-y-0.5" aria-label="Instagram">
                      <Instagram className="h-5 w-5 text-background" />
                    </a>
                    <a href="https://twitter.com/alanorte" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-foreground hover:bg-primary flex items-center justify-center transition-all hover:-translate-y-0.5" aria-label="Twitter X">
                      <Twitter className="h-5 w-5 text-background" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacto;
