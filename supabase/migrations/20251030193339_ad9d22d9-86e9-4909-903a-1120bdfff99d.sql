-- Crear tabla de subcategorías
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- RLS Policies para subcategories
CREATE POLICY "Subcategories are viewable by everyone" 
  ON public.subcategories FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage subcategories" 
  ON public.subcategories FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Agregar columnas a equipment
ALTER TABLE public.equipment 
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.subcategories(id),
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS detailed_description TEXT,
  ADD COLUMN IF NOT EXISTS detailed_specs JSONB DEFAULT '[]'::jsonb;

-- Crear tabla spaces
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  detailed_description TEXT,
  price INTEGER NOT NULL,
  promotion TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'available',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS para spaces
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies para spaces
CREATE POLICY "Spaces are viewable by everyone" 
  ON public.spaces FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage spaces" 
  ON public.spaces FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at en subcategories
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en spaces
CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Actualizar/insertar categorías principales
INSERT INTO public.categories (name, name_en, slug, order_index) VALUES
  ('FOTOGRAFÍA', 'Photography', 'fotografia', 1),
  ('LUCES', 'Lights', 'luces', 2),
  ('ACCESORIOS Y GRIP', 'Accessories and Grip', 'accesorios-y-grip', 3),
  ('SONIDO', 'Sound', 'sonido', 4),
  ('ENERGÍA Y DISTRIBUCIÓN', 'Energy and Distribution', 'energia-y-distribucion', 5),
  ('VARIOS', 'Various', 'varios', 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  order_index = EXCLUDED.order_index;

-- Insertar subcategorías para FOTOGRAFÍA
INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, sub.name, sub.name_en, sub.slug, sub.order_index
FROM public.categories c,
(VALUES
  ('Cámaras', 'Cameras', 'camaras', 1),
  ('Lentes', 'Lenses', 'lentes', 2),
  ('Adaptadores Lentes / Metabones', 'Lens Adapters / Metabones', 'adaptadores-lentes-metabones', 3),
  ('Filtros', 'Filters', 'filtros', 4),
  ('Accesorios de cámara', 'Camera Accessories', 'accesorios-de-camara', 5),
  ('Monitoreo / EVF / Transmisores Wireless', 'Monitoring / EVF / Wireless Transmitters', 'monitoreo-evf-transmisores-wireless', 6),
  ('Trípodes cámara - Monopies - Shoulders', 'Camera Tripods - Monopods - Shoulders', 'tripodes-camara-monopies-shoulders', 7),
  ('Estabilizadores / Gimbals / Sliders / Pluma', 'Stabilizers / Gimbals / Sliders / Boom', 'estabilizadores-gimbals-sliders-pluma', 8),
  ('Grabadores externos', 'External Recorders', 'grabadores-externos', 9),
  ('Cables BNC', 'BNC Cables', 'cables-bnc', 10),
  ('Cables HDMI', 'HDMI Cables', 'cables-hdmi', 11),
  ('Video Transmisión Inalámbrica', 'Wireless Video Transmission', 'video-transmision-inalambrica', 12),
  ('Comunicación', 'Communication', 'comunicacion', 13)
) AS sub(name, name_en, slug, order_index)
WHERE c.slug = 'fotografia'
ON CONFLICT (slug) DO NOTHING;

-- Insertar subcategorías para LUCES
INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, sub.name, sub.name_en, sub.slug, sub.order_index
FROM public.categories c,
(VALUES
  ('HMI', 'HMI', 'hmi', 1),
  ('Luces LED', 'LED Lights', 'luces-led', 2),
  ('Faroles Tungsteno', 'Tungsten Lights', 'faroles-tungsteno', 3),
  ('Tubos Fluorescentes', 'Fluorescent Tubes', 'tubos-fluorescentes', 4),
  ('Accesorios iluminación y grip', 'Lighting and Grip Accessories', 'accesorios-iluminacion-y-grip', 5)
) AS sub(name, name_en, slug, order_index)
WHERE c.slug = 'luces'
ON CONFLICT (slug) DO NOTHING;

-- Insertar subcategorías para ACCESORIOS Y GRIP
INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, sub.name, sub.name_en, sub.slug, sub.order_index
FROM public.categories c,
(VALUES
  ('Grip', 'Grip', 'grip', 1),
  ('Accesorios', 'Accessories', 'accesorios', 2),
  ('Trípodes iluminación', 'Lighting Tripods', 'tripodes-iluminacion', 3),
  ('Máquina de humo', 'Smoke Machine', 'maquina-de-humo', 4),
  ('Banderas/Marcos/Tamices/Pantallas', 'Flags/Frames/Scrims/Screens', 'banderas-marcos-tamices-pantallas', 5)
) AS sub(name, name_en, slug, order_index)
WHERE c.slug = 'accesorios-y-grip'
ON CONFLICT (slug) DO NOTHING;

-- Insertar subcategorías para SONIDO
INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, sub.name, sub.name_en, sub.slug, sub.order_index
FROM public.categories c,
(VALUES
  ('Varios', 'Various', 'varios-sonido', 1),
  ('Grabadores de sonido', 'Sound Recorders', 'grabadores-de-sonido', 2),
  ('Micrófonos', 'Microphones', 'microfonos', 3),
  ('Micrófonos inalámbricos', 'Wireless Microphones', 'microfonos-inalambricos', 4),
  ('Accesorios de sonido', 'Sound Accessories', 'accesorios-de-sonido', 5),
  ('Soportes, paravientos y cañas', 'Supports, Windshields and Booms', 'soportes-paravientos-y-canas', 6),
  ('Mixer''s', 'Mixers', 'mixers', 7),
  ('Auriculares', 'Headphones', 'auriculares', 8),
  ('Distribución Auriculares', 'Headphone Distribution', 'distribucion-auriculares', 9)
) AS sub(name, name_en, slug, order_index)
WHERE c.slug = 'sonido'
ON CONFLICT (slug) DO NOTHING;

-- Insertar subcategorías para ENERGÍA Y DISTRIBUCIÓN
INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, sub.name, sub.name_en, sub.slug, sub.order_index
FROM public.categories c,
(VALUES
  ('Energía', 'Energy', 'energia', 1),
  ('Alargues y zapatillas', 'Extension Cords and Power Strips', 'alargues-y-zapatillas', 2)
) AS sub(name, name_en, slug, order_index)
WHERE c.slug = 'energia-y-distribucion'
ON CONFLICT (slug) DO NOTHING;

-- Insertar subcategorías para VARIOS
INSERT INTO public.subcategories (category_id, name, name_en, slug, order_index)
SELECT c.id, sub.name, sub.name_en, sub.slug, sub.order_index
FROM public.categories c,
(VALUES
  ('Carros de travelling', 'Dolly Carts', 'carros-de-travelling', 1),
  ('Flashes / Fotómetro / Proyector', 'Flashes / Light Meter / Projector', 'flashes-fotometro-proyector', 2),
  ('Baterías', 'Batteries', 'baterias', 3),
  ('Estudio', 'Studio', 'estudio', 4),
  ('Servicios audiovisuales', 'Audiovisual Services', 'servicios-audiovisuales', 5)
) AS sub(name, name_en, slug, order_index)
WHERE c.slug = 'varios'
ON CONFLICT (slug) DO NOTHING;

-- Insertar los dos espacios principales
INSERT INTO public.spaces (name, slug, description, detailed_description, price, promotion, amenities, specs, status, order_index)
VALUES
  (
    'GALERÍA DE FILMACIÓN',
    'galeria-de-filmacion',
    'El espacio perfecto para tu proyecto',
    'GALERÍA ALA NORTE - 150 metros cuadrados',
    70000,
    '¡20% DE DESCUENTO EN EQUIPOS EXTRA!',
    '["Infinito blanco de 6 m de ancho x 3 m de alto", "5 m de piso blanco y 11 m de tiro de cámara", "Infinito negro y Chroma verde (3 m x 6 m) incluidos", "3 fresneles 1k dimerizables de contraluz", "16 tubos frontal/cenital", "2 x 4 tubos laterales"]'::jsonb,
    '{"area": "150 metros cuadrados", "horario": "LUNES A VIERNES DE 9 A 18HS", "bloque": "4HS", "opcionales": ["Tablero trifásico", "Back up de generador", "Pintura", "Streaming", "Podcast"]}'::jsonb,
    'available',
    1
  ),
  (
    'SALA DE SONIDO',
    'sala-de-sonido',
    'Locución / Postproducción / Edición / Color',
    'ProTools Ultimate - Climatizada - Insonorizada',
    0,
    NULL,
    '["ProTools Ultimate", "Climatizada", "Insonorizada", "Locución", "Postproducción", "Edición", "Color"]'::jsonb,
    '{}'::jsonb,
    'available',
    2
  )
ON CONFLICT (slug) DO NOTHING;