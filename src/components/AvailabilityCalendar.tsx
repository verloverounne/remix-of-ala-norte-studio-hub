import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, differenceInDays, format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { DateRange } from "react-day-picker";

interface AvailabilityCalendarProps {
  equipmentId: string;
  pricePerDay: number;
  pricePerWeek?: number;
  equipmentName: string;
}

export const AvailabilityCalendar = ({
  equipmentId,
  pricePerDay,
  pricePerWeek,
  equipmentName,
}: AvailabilityCalendarProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [availability, setAvailability] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [equipmentId]);

  const fetchAvailability = async () => {
    setLoading(true);
    const startDate = startOfDay(new Date());
    const endDate = addDays(startDate, 90); // 3 months ahead

    const { data, error } = await supabase
      .from("equipment_availability")
      .select("date, status, quantity_available")
      .eq("equipment_id", equipmentId)
      .gte("date", format(startDate, "yyyy-MM-dd"))
      .lte("date", format(endDate, "yyyy-MM-dd"));

    if (!error && data) {
      const availabilityMap: Record<string, string> = {};
      data.forEach((item) => {
        availabilityMap[item.date] = item.status;
      });
      setAvailability(availabilityMap);
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const days = differenceInDays(dateRange.to, dateRange.from) + 1;
    
    // If has week price and >= 7 days, use week price
    if (pricePerWeek && days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return (weeks * pricePerWeek + remainingDays * pricePerDay) * quantity;
    }
    
    return days * pricePerDay * quantity;
  };

  const getDaysCount = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1;
  };

  const handleReserve = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Selecciona un rango de fechas",
        variant: "destructive",
      });
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: "Error",
        description: "Completa todos los datos de contacto",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reservations").insert({
      equipment_id: equipmentId,
      start_date: format(dateRange.from, "yyyy-MM-dd"),
      end_date: format(dateRange.to, "yyyy-MM-dd"),
      quantity,
      total_price: calculateTotal(),
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la reserva. Intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reserva creada",
      description: "Tu solicitud de reserva ha sido enviada. Te contactaremos pronto.",
    });

    // Reset form
    setDateRange(undefined);
    setQuantity(1);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNotes("");
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const status = availability[dateStr];
    return status === "booked" || status === "maintenance";
  };

  const isDatePast = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-xl mb-4 uppercase flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Disponibilidad y Reserva
        </h3>
        
        <div className="border-2 border-foreground p-4 bg-card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="font-heading mb-2 block">Selecciona las fechas</Label>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={(date) => isDatePast(date) || isDateUnavailable(date)}
                  className="rounded-md border-2 border-foreground pointer-events-auto"
                  locale={es}
                  modifiers={{
                    unavailable: (date) => isDateUnavailable(date),
                  }}
                  modifiersClassNames={{
                    unavailable: "bg-destructive/20 text-destructive line-through",
                  }}
                />
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-destructive/20 rounded" />
                    <span>No disponible</span>
                  </div>
                </div>
              </div>

              {dateRange?.from && dateRange?.to && (
                <div className="space-y-4">
                  <div className="border-t-2 border-foreground pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground font-heading">Desde</p>
                        <p className="font-heading text-lg">
                          {format(dateRange.from, "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-heading">Hasta</p>
                        <p className="font-heading text-lg">
                          {format(dateRange.to, "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="quantity" className="font-heading">
                          Cantidad
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="border-2 border-foreground mt-1"
                        />
                      </div>

                      <div className="bg-primary/5 border-2 border-primary p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-heading">Días:</span>
                          <span className="font-heading text-lg">{getDaysCount()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-heading">Total:</span>
                          <span className="font-heading text-2xl text-primary">
                            ${(calculateTotal() / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-foreground pt-4 space-y-3">
                    <h4 className="font-heading text-lg uppercase">Datos de Contacto</h4>
                    
                    <div>
                      <Label htmlFor="name" className="font-heading">
                        Nombre completo *
                      </Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="border-2 border-foreground mt-1"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="font-heading">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="border-2 border-foreground mt-1"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="font-heading">
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="border-2 border-foreground mt-1"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="font-heading">
                        Notas adicionales
                      </Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="border-2 border-foreground mt-1"
                        placeholder="Información adicional sobre tu reserva..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleReserve}
                      disabled={submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "SOLICITAR RESERVA"
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      * Tu reserva será confirmada por nuestro equipo en las próximas 24 horas
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
