import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calendar as CalendarIcon, Mail, Phone, Building2, ShoppingCart, Send, AlertCircle, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Cotizador = () => {
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, clearCart, totalItems, calculateSubtotal } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    startDate: "",
    endDate: "",
    comments: ""
  });
  const [unavailableEquipment, setUnavailableEquipment] = useState<Set<string>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Check equipment availability when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate && items.length > 0) {
      checkEquipmentAvailability();
    }
  }, [formData.startDate, formData.endDate, items]);

  const checkEquipmentAvailability = async () => {
    if (!formData.startDate || !formData.endDate) return;
    setCheckingAvailability(true);
    const unavailable = new Set<string>();
    for (const item of items) {
      const { data, error } = await supabase
        .from('equipment_unavailability')
        .select('*')
        .eq('equipment_id', item.id)
        .or(`and(start_date.lte.${formData.endDate},end_date.gte.${formData.startDate})`);
      if (!error && data && data.length > 0) {
        unavailable.add(item.id);
      }
    }
    setUnavailableEquipment(unavailable);
    setCheckingAvailability(false);
  };

  const days = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 1;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = differenceInDays(end, start);
    return Math.max(1, diff);
  }, [formData.startDate, formData.endDate]);

  const totalAmount = calculateSubtotal(days);

  const handleSubmit = (e: React.FormEvent, sendVia: 'email' | 'whatsapp') => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un equipo a tu reserva.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas de reserva.",
        variant: "destructive"
      });
      return;
    }

    // Check if any equipment is unavailable
    if (unavailableEquipment.size > 0) {
      toast({
        title: "Error",
        description: "Hay equipos no disponibles en las fechas seleccionadas. Por favor elimínalos del carrito.",
        variant: "destructive"
      });
      return;
    }

    // Generate detailed quote message
    const equipmentList = items.map(item => `${item.name} x${item.quantity} - $${(item.pricePerDay * item.quantity * days).toLocaleString()}`).join('\n');
    const message = `
━━━━━━━━━━━━━━━━━━━━
COTIZACIÓN ALA NORTE
━━━━━━━━━━━━━━━━━━━━

📋 DATOS CLIENTE:
Nombre: ${formData.name}
Email: ${formData.email}
Teléfono: ${formData.phone}
${formData.company ? `Empresa: ${formData.company}` : ''}

📅 FECHAS RESERVA:
Inicio: ${format(new Date(formData.startDate), 'dd/MM/yyyy', { locale: es })}
Fin: ${format(new Date(formData.endDate), 'dd/MM/yyyy', { locale: es })}
Días totales: ${days}

🎬 EQUIPOS SOLICITADOS:
${equipmentList}

💰 TOTAL APROXIMADO: $${totalAmount.toLocaleString()}

${formData.comments ? `📝 COMENTARIOS:\n${formData.comments}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
⚠️ Esta es una cotización tentativa.
Los precios y disponibilidad deben confirmarse.
Contactar cliente para coordinar entrega/retiro.
    `.trim();

    if (sendVia === 'whatsapp') {
      const whatsappNumber = "541147180732";
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
      toast({
        title: "Cotización enviada",
        description: "Te redirigimos a WhatsApp para finalizar tu solicitud."
      });
    } else {
      const emailTo = "info@alanortecinedigital.com";
      const emailSubject = encodeURIComponent(`Cotización ALA NORTE - ${formData.name}`);
      const emailBody = encodeURIComponent(message);
      window.open(`mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`, "_blank");
      toast({
        title: "Cotización preparada",
        description: "Se abrió tu cliente de correo para enviar la solicitud."
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-14 sm:pt-16 bg-background">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground py-12 sm:py-16 lg:py-20 border-b border-border bg-foreground px-4 sm:px-8">
        <div className="container mx-auto text-left px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4 sm:mb-6 lg:text-7xl px-0 my-0 mt-0 mx-0">ARMÁ TU PRESUPUESTO</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl">
            {totalItems > 0 ? `Tienes ${totalItems} ${totalItems === 1 ? 'equipo' : 'equipos'} en tu carrito` : 'Agrega equipos desde el catálogo para comenzar'}
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* 1. Sección Cliente Nuevo */}
          <Card className="mb-6 sm:mb-8 border-2 border-primary bg-primary/5">
            <CardContent className="py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  <h2 className="font-heading text-lg sm:text-xl lg:text-2xl">¿Sos cliente nuevo?</h2>
                </div>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto"
                >
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSf1JuBZQnlUe_-lGfKMzmaNI9386GKhpg32y54IpqBjpQk0hA/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    REGISTRATE
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. Cómo funciona - Collapsible */}
          <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
            <Card className="mb-6 sm:mb-8 border border-primary">
              <CardHeader className="bg-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg sm:text-xl lg:text-2xl">Cómo funciona el alquiler en ALA NORTE</CardTitle>
                    <CardDescription>Buscamos que el proceso sea claro y sencillo, desde la consulta inicial hasta la devolución del equipo.</CardDescription>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      {isHowItWorksOpen ? (
                        <>
                          <span className="hidden sm:inline">Menos</span>
                          <ChevronUp className="h-5 w-5" />
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Más</span>
                          <ChevronDown className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-4 sm:pt-6">
                  <ol className="space-y-3 font-heading">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-primary text-xl">1.</span>
                      <div>
                        <span className="font-bold">Contanos tu proyecto</span>
                        <p className="font-sans text-sm text-muted-foreground">Compartinos qué querés filmar, fechas, locaciones y equipo que tenés o necesitás.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-primary text-xl">2.</span>
                      <div>
                        <span className="font-bold">Armamos una propuesta</span>
                        <p className="font-sans text-sm text-muted-foreground">Te sugerimos un set de equipamiento en función de tu visión, tu presupuesto y la escala del rodaje.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-primary text-xl">3.</span>
                      <div>
                        <span className="font-bold">Coordinamos retiro y devolución</span>
                        <p className="font-sans text-sm text-muted-foreground">Definimos horarios, punto de entrega y condiciones de uso para que llegues al rodaje sin sorpresas.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-primary text-xl">4.</span>
                      <div>
                        <span className="font-bold">Acompañamiento durante el rodaje</span>
                        <p className="font-sans text-sm text-muted-foreground">Si surge alguna duda con el equipo, estamos disponibles para ayudarte a resolverla.</p>
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 3. Equipos en Reserva */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                    EQUIPOS EN RESERVA
                  </CardTitle>
                  <CardDescription>
                    {items.length === 0 ? 'Tu carrito está vacío' : `${items.length} ${items.length === 1 ? 'equipo' : 'equipos'} seleccionados`}
                  </CardDescription>
                </div>
                {items.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart} className="w-full sm:w-auto">
                    Vaciar carrito
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-foreground/20">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-heading text-xl mb-2">Todavía no hay equipos en tu lista</p>
                  <p className="text-muted-foreground mb-4">Explorá el catálogo y sumá lo que necesitás.</p>
                  <Button asChild className="w-full sm:w-auto">
                    <a href="/equipos">VER CATÁLOGO</a>
                  </Button>
                </div>
              ) : (
                <>
                  {unavailableEquipment.size > 0 && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Algunos equipos no están disponibles en las fechas seleccionadas. Elimínalos del carrito para continuar.
                      </AlertDescription>
                    </Alert>
                  )}
                  {items.map(item => {
                    const isUnavailable = unavailableEquipment.has(item.id);
                    return (
                      <Card key={item.id} className={`overflow-hidden ${isUnavailable ? 'border-destructive border-2' : ''}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-4 p-4">
                          {/* Image */}
                          <div className="aspect-square w-20 sm:w-full bg-muted overflow-hidden relative mx-auto sm:mx-0">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className={`w-full h-full object-cover ${isUnavailable ? 'grayscale opacity-50' : 'grayscale'}`} 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <span className="text-xs font-heading opacity-20">IMG</span>
                              </div>
                            )}
                            {isUnavailable && (
                              <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-2 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                              <h3 className="font-heading text-lg uppercase">{item.name}</h3>
                              {isUnavailable && (
                                <Badge variant="destructive" className="text-xs">
                                  NO DISPONIBLE
                                </Badge>
                              )}
                            </div>
                            {item.brand && <p className="text-sm text-muted-foreground font-mono">{item.brand}</p>}
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 border-2 border-foreground">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                  disabled={isUnavailable}
                                >
                                  -
                                </Button>
                                <span className="font-heading w-8 text-center">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                  disabled={isUnavailable}
                                >
                                  +
                                </Button>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">${item.pricePerDay.toLocaleString()}/día × {item.quantity} × {days} días</span>
                              </div>
                            </div>
                            <div className="font-heading text-xl text-primary">
                              ${(item.pricePerDay * item.quantity * days).toLocaleString()}
                            </div>
                            {isUnavailable && (
                              <p className="text-xs text-destructive">
                                Este equipo tiene periodos de mantenimiento/reserva en las fechas seleccionadas
                              </p>
                            )}
                          </div>

                          {/* Remove */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.id)} 
                            className="text-destructive hover:text-destructive mx-auto sm:mx-0"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. Fechas de Reserva */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                FECHAS DE RESERVA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Fecha inicio <span className="text-destructive">*</span>
                  </Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    Fecha fin <span className="text-destructive">*</span>
                  </Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} min={formData.startDate} required className="w-full" />
                </div>
              </div>
              {formData.startDate && formData.endDate && (
                <div className="p-4 bg-primary/10 border-2 border-primary">
                  <p className="font-heading text-2xl text-center">
                    {days} {days === 1 ? 'DÍA' : 'DÍAS'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Datos del Cliente */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">DATOS DEL CLIENTE</CardTitle>
              <CardDescription>
                Completa tus datos para recibir la cotización.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+54 11 1234-5678" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    Empresa / Producción
                  </Label>
                  <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Nombre de tu empresa o producción" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">
                  Comentarios adicionales
                </Label>
                <Textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} placeholder="Servicios adicionales, instrucciones especiales..." rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Total y Botones de Envío */}
          <Card className="border-4 border-primary shadow-brutal-red mb-6 sm:mb-8">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-2xl sm:text-3xl text-center">TOTAL APROXIMADO</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 shadow-none">
              <div className="text-center space-y-2 mb-6">
                <p className="font-heading text-4xl sm:text-5xl text-primary">
                  ${totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  Precio tentativo - sujeto a confirmación
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  onClick={e => handleSubmit(e, 'whatsapp')} 
                  size="lg" 
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-3 border-foreground" 
                  disabled={items.length === 0}
                >
                  <Send className="mr-2 h-5 w-5" />
                  ENVIAR POR WHATSAPP
                </Button>
                
                <Button 
                  onClick={e => handleSubmit(e, 'email')} 
                  variant="outline" 
                  size="lg" 
                  className="w-full" 
                  disabled={items.length === 0}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  ENVIAR POR EMAIL
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
};

export default Cotizador;
