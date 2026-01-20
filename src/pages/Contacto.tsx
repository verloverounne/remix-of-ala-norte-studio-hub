import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map.tsx";
import { supabase } from "@/integrations/supabase/client";

const Contacto = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactVideo, setContactVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactVideo = async () => {
      const { data } = await supabase
        .from("gallery_images")
        .select("image_url, media_type")
        .eq("page_type", "contacto")
        .order("order_index", { ascending: true })
        .limit(1)
        .single();

      if (data && data.media_type === "video") {
        setContactVideo(data.image_url);
      }
    };
    fetchContactVideo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Ups",
        description: "Algo no funcionó. Verificá los datos e intentá de nuevo.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the form data to a backend
    toast({
      title: "¡Listo!",
      description: "Tu consulta fue enviada. Te vamos a responder lo antes posible.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl text-left">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Hablemos de tu próximo rodaje</h1>
          <p className="text-xl md:text-2xl max-w-3xl text-left">
            Completá el formulario con algunos datos de tu proyecto y te respondemos con una propuesta de equipamiento y
            presupuesto.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 flex gap-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Envíanos un mensaje</CardTitle>
                <CardDescription>Completá el formulario y te respondemos a la brevedad</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Tu nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Tu mail de contacto <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      ¿Qué equipo tenés en mente o qué necesitás? <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Contanos brevemente de qué se trata tu proyecto..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
              {/* Map */}
              <Card className="flex gap-4 overflow-hidden">
                <div className="h-150">
                  <Map
                    address="V. S. de Liniers 1565, Vicente López, Buenos Aires, Argentina"
                    latitude={-34.527}
                    longitude={-58.475}
                  />
                </div>
              </Card>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Vertical Video */}
              {contactVideo && (
                <div className="aspect-[9/16] w-full rounded-lg overflow-hidden bg-muted">
                  <video src={contactVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Dirección</p>
                      <p className="text-muted-foreground">
                        V. S. de Liniers 1565
                        <br />
                        Vicente López, Buenos Aires
                        <br />
                        Argentina
                      </p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Síguenos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <a
                      href="https://www.facebook.com/alanortecinedigital"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all hover-scale"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.instagram.com/alanortecinedigital/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all hover-scale"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="https://twitter.com/alanorte"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all hover-scale"
                      aria-label="Twitter X"
                    >
                      <Twitter className="h-5 w-5" />
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
