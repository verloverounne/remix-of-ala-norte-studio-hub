import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Calendar as CalendarIcon, Mail, Phone, Building2, ShoppingCart, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    comments: "",
  });

  const [unavailableEquipment, setUnavailableEquipment] = useState<Set<string>>(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);

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
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un equipo a tu reserva.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas de reserva.",
        variant: "destructive",
      });
      return;
    }

    // Check if any equipment is unavailable
    if (unavailableEquipment.size > 0) {
      toast({
        title: "Error",
        description: "Hay equipos no disponibles en las fechas seleccionadas. Por favor elimínalos del carrito.",
        variant: "destructive",
      });
      return;
    }

    // Generate detailed quote message
    const equipmentList = items
      .map((item) => `${item.name} x${item.quantity} - $${(item.pricePerDay * item.quantity * days).toLocaleString()}`)
      .join('\n');

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
      const whatsappNumber = "5491123456789";
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
      
      toast({
        title: "Cotización enviada",
        description: "Te redirigimos a WhatsApp para finalizar tu solicitud.",
      });
    } else {
      // Email functionality would be implemented here with an edge function
      toast({
        title: "Próximamente",
        description: "La función de envío por email estará disponible pronto.",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-14 sm:pt-16 bg-muted/30">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground py-12 sm:py-16 lg:py-20 border-b-4 border-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6">
            CARRITO DE RESERVA
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto">
            {totalItems > 0 
              ? `Tienes ${totalItems} ${totalItems === 1 ? 'equipo' : 'equipos'} en tu carrito`
              : 'Agrega equipos desde el catálogo para comenzar'
            }
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Instrucciones */}
          <Card className="mb-6 sm:mb-8 border-2 sm:border-4 border-primary">
            <CardHeader className="bg-primary/10">
              <CardTitle className="font-heading text-lg sm:text-xl lg:text-2xl">CÓMO RESERVAR</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <ol className="space-y-3 font-heading">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">1.</span>
                  <span>SELECCIONA TU EQUIPAMIENTO desde el catálogo y agrega las cantidades necesarias</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">2.</span>
                  <span>INDICA LAS FECHAS DE RESERVA en el calendario (fecha inicio y fin)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">3.</span>
                  <span>SI NO ERES CLIENTE, <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSf1JuBZQnlUe_-lGfKMzmaNI9386GKhpg32y54IpqBjpQk0hA/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline font-bold"
                  >
                    REGÍSTRATE AQUÍ
                  </a></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">4.</span>
                  <span>COMPLETA EL FORMULARIO con tus datos de contacto</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-primary text-xl">5.</span>
                  <span>ENVÍA TU COTIZACIÓN por WhatsApp o Email</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items - 2 columns */}
            <Card className="lg:col-span-2 order-2 lg:order-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      EQUIPOS EN RESERVA
                    </CardTitle>
                    <CardDescription>
                      {items.length === 0 ? 'Tu carrito está vacío' : `${items.length} ${items.length === 1 ? 'equipo' : 'equipos'} seleccionados`}
                    </CardDescription>
                  </div>
                  {items.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearCart}>
                      Vaciar carrito
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 border-3 border-dashed border-foreground/20">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="font-heading text-xl mb-2">NO HAY EQUIPOS EN EL CARRITO</p>
                    <p className="text-muted-foreground mb-4">Agrega equipos desde el catálogo</p>
                    <Button asChild>
                      <a href="/equipos">VER EQUIPOS</a>
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
                    {items.map((item) => {
                      const isUnavailable = unavailableEquipment.has(item.id);
                      return (
                        <Card key={item.id} className={`overflow-hidden ${isUnavailable ? 'border-destructive border-2' : ''}`}>
                          <div className="grid grid-cols-[80px_1fr_auto] gap-4 p-4">
                            {/* Image */}
                            <div className="aspect-square bg-muted overflow-hidden relative">
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
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <h3 className="font-heading text-lg uppercase">{item.name}</h3>
                                {isUnavailable && (
                                  <Badge variant="destructive" className="text-xs">
                                    NO DISPONIBLE
                                  </Badge>
                                )}
                              </div>
                              {item.brand && (
                                <p className="text-sm text-muted-foreground font-mono">{item.brand}</p>
                              )}
                              <div className="flex items-center gap-4">
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
                              className="text-destructive hover:text-destructive"
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

            {/* Form & Summary - 1 column */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Dates Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    FECHAS DE RESERVA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Fecha inicio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      Fecha fin <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate}
                      required
                    />
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

              {/* Total Card */}
              <Card className="border-4 border-primary shadow-brutal-red">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="text-3xl text-center">TOTAL APROXIMADO</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <p className="font-heading text-5xl text-primary">
                      ${totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      Precio tentativo - sujeto a confirmación
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Client Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">DATOS DEL CLIENTE</CardTitle>
                  <CardDescription>
                    Completa tus datos para recibir la cotización.{" "}
                    <a 
                      href="https://docs.google.com/forms/d/e/1FAIpQLSf1JuBZQnlUe_-lGfKMzmaNI9386GKhpg32y54IpqBjpQk0hA/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      ¿Eres cliente nuevo? Regístrate aquí
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nombre completo <span className="text-destructive">*</span>
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
                      Email <span className="text-destructive">*</span>
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
                    <Label htmlFor="phone">
                      Teléfono <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+54 11 1234-5678"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">
                      Empresa / Producción
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Nombre de tu empresa o producción"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">
                      Comentarios adicionales
                    </Label>
                    <Textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      placeholder="Servicios adicionales, instrucciones especiales..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={(e) => handleSubmit(e, 'whatsapp')}
                      size="lg"
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-3 border-foreground"
                      disabled={items.length === 0}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      ENVIAR POR WHATSAPP
                    </Button>
                    
                    <Button
                      onClick={(e) => handleSubmit(e, 'email')}
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cotizador;
