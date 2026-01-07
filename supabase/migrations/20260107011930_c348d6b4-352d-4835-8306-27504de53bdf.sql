-- Create home_services table for the services section
CREATE TABLE public.home_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Home services are viewable by everyone" 
ON public.home_services 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage home services" 
ON public.home_services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_home_services_updated_at
BEFORE UPDATE ON public.home_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial services
INSERT INTO public.home_services (title, description, order_index) VALUES
('Alquiler de equipos de filmación', 'Contamos con un amplio catálogo de equipos profesionales para cine, televisión y publicidad. Desde cámaras y ópticas hasta grip e iluminación.', 0),
('Galería de filmación', 'Espacios versátiles y completamente equipados para tus producciones. Ciclorama, sets modulares y control total de iluminación.', 1),
('Isla de edición de sonido e imagen', 'Suites de post-producción con estaciones de trabajo profesionales, monitoreo calibrado y ambiente acústico controlado.', 2),
('Profesionales y asesoramiento creativo-técnico', 'Un equipo de especialistas a tu disposición para resolver desafíos técnicos y potenciar tu visión creativa.', 3),
('Multicámara y móvil HD', 'Soluciones integrales para eventos en vivo, streaming y producciones multicámara con unidades móviles de alta definición.', 4),
('Formación y comunidad', 'Workshops, masterclasses y eventos para profesionales. Un espacio de encuentro y crecimiento para la comunidad audiovisual.', 5);