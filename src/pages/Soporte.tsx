import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Truck, FileText, MessageCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Soporte = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      title: "Alquiler y Reservas",
      icon: <FileText className="h-5 w-5" />,
      faqs: [
        {
          question: "¿Cómo puedo reservar un equipo?",
          answer: "Podés reservar desde nuestra web agregando equipos al cotizador y completando el formulario. También podés escribirnos por WhatsApp o email con tu lista de equipos y fechas."
        },
        {
          question: "¿Con cuánta anticipación debo reservar?",
          answer: "Recomendamos reservar con al menos 7 días de anticipación para producciones grandes. Para equipos específicos o temporada alta, sugerimos 15-20 días."
        },
        {
          question: "¿Puedo modificar o cancelar mi reserva?",
          answer: "Sí, podés modificar tu reserva hasta 48hs antes del inicio. Cancelaciones con más de 72hs de anticipación no tienen cargo. Cancelaciones tardías pueden generar un cargo del 20%."
        },
        {
          question: "¿Qué incluye el alquiler?",
          answer: "El alquiler incluye el equipo, cables y accesorios básicos, transporte en CABA/GBA, y soporte técnico durante el período de alquiler."
        }
      ]
    },
    {
      title: "Seguros y Garantías",
      icon: <Shield className="h-5 w-5" />,
      faqs: [
        {
          question: "¿Los equipos están asegurados?",
          answer: "Sí, todos nuestros equipos cuentan con seguro contra todo riesgo. El cliente es responsable por el uso correcto del equipo según las especificaciones técnicas."
        },
        {
          question: "¿Qué cubre el seguro?",
          answer: "El seguro cubre daños accidentales durante el uso normal del equipo. No cubre: negligencia, uso incorrecto, robo sin denuncia policial, o daños por condiciones extremas no autorizadas."
        },
        {
          question: "¿Necesito dejar una seña?",
          answer: "Sí, solicitamos una seña del 30% al confirmar la reserva. El saldo restante se abona al retirar el equipo. Aceptamos transferencia, efectivo y tarjeta."
        },
        {
          question: "¿Qué pasa si el equipo falla durante el rodaje?",
          answer: "Tenemos equipos de respaldo disponibles. En caso de falla técnica, te proporcionamos un reemplazo sin cargo adicional. Contamos con soporte técnico 24/7."
        }
      ]
    },
    {
      title: "Envíos y Devoluciones",
      icon: <Truck className="h-5 w-5" />,
      faqs: [
        {
          question: "¿Hacen envíos a todo el país?",
          answer: "Sí, enviamos a todo el territorio argentino. Trabajamos con OCA, Andreani y correos especializados para equipos delicados."
        },
        {
          question: "¿Cuánto demora el envío?",
          answer: "CABA/GBA: 24-48hs. Interior: 48-72hs. Envíos urgentes disponibles con cargo adicional. Coordinamos el envío para que llegue 1 día antes del rodaje."
        },
        {
          question: "¿Quién se hace cargo del envío?",
          answer: "Los envíos dentro de CABA están incluidos. Para GBA e interior, el costo de envío se calcula según destino y volumen de equipo. El cliente paga ambos envíos (ida y vuelta)."
        },
        {
          question: "¿Cómo devuelvo el equipo?",
          answer: "Podés devolverlo en nuestra oficina, coordinar retiro en CABA/GBA (sin cargo), o enviarlo por correo. Debe llegar el día pactado antes de las 18hs."
        }
      ]
    },
    {
      title: "Uso y Mantenimiento",
      icon: <Download className="h-5 w-5" />,
      faqs: [
        {
          question: "¿Proporcionan capacitación sobre los equipos?",
          answer: "Sí, ofrecemos una inducción gratuita de 30min al retirar el equipo. También tenemos talleres pagos más extensos y manuales descargables."
        },
        {
          question: "¿Puedo probar el equipo antes de alquilar?",
          answer: "Sí, ofrecemos pruebas de equipo sin cargo en nuestra oficina. Coordiná un turno para probar cámaras, lentes o cualquier equipo antes de tu producción."
        },
        {
          question: "¿Qué hago si tengo problemas técnicos?",
          answer: "Contactanos de inmediato por WhatsApp (11-XXXX-XXXX), email o teléfono. Nuestro equipo técnico está disponible 24/7 para resolver problemas en tiempo real."
        },
        {
          question: "¿Debo limpiar el equipo antes de devolverlo?",
          answer: "No es necesario. Hacemos mantenimiento profesional a todos los equipos. Solo pedimos que lo devuelvas en el mismo estado en que lo recibiste."
        }
      ]
    }
  ];

  const manuals = [
    { name: "Guía de uso - Cámaras RED", size: "2.3 MB" },
    { name: "Manual - Luces ARRI", size: "1.8 MB" },
    { name: "Configuración - Monitores", size: "950 KB" },
    { name: "Guía - Sonido directo", size: "1.5 MB" }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-6xl mb-6 tracking-tight">
              CENTRO DE SOPORTE
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Encontrá respuestas rápidas a tus preguntas sobre alquiler, seguros, envíos y más.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscá tu pregunta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Button asChild size="lg" variant="outline" className="h-auto py-6 font-heading">
              <Link to="/contacto" className="flex flex-col items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                <span>CHAT TÉCNICO</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-auto py-6 font-heading">
              <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                <span>WHATSAPP</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-auto py-6 font-heading">
              <Link to="/contacto" className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>FORMULARIO</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl mb-12 text-center">
            PREGUNTAS FRECUENTES
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((category, index) => (
                <Card key={index} className="border-2 border-foreground shadow-brutal">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{category.icon}</div>
                      <CardTitle className="font-heading text-2xl">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                          <AccordionTrigger className="text-left font-semibold">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2 border-foreground shadow-brutal">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No encontramos resultados para "{searchTerm}". 
                    <br />
                    Intentá con otros términos o <Link to="/contacto" className="text-primary underline">contactanos directamente</Link>.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Manuals Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Download className="h-10 w-10 text-primary" />
            <h2 className="font-heading text-3xl md:text-4xl">MANUALES DESCARGABLES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {manuals.map((manual, index) => (
              <Card key={index} className="border-2 border-foreground shadow-brutal">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-heading text-base">{manual.name}</CardTitle>
                  <Badge variant="secondary">{manual.size}</Badge>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full font-heading">
                    DESCARGAR PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl mb-6">
              ¿NO ENCONTRASTE LO QUE BUSCABAS?
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Nuestro equipo de soporte está disponible para ayudarte. Escribinos y te respondemos en minutos.
            </p>
            <Button asChild size="lg" className="font-heading">
              <Link to="/contacto">CONTACTAR SOPORTE</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Soporte;
