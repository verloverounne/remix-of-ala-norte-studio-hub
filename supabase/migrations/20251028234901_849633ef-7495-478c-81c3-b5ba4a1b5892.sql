-- =====================================================
-- ALA NORTE CINEMATOGRÁFICO - BASE DE DATOS COMPLETA
-- =====================================================

-- Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Crear enum para estados de equipo
CREATE TYPE public.equipment_status AS ENUM ('available', 'rented', 'maintenance');

-- =====================================================
-- TABLA: user_roles (Sistema de roles seguro)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =====================================================
-- TABLA: profiles (Perfiles de usuario)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: categories (Categorías de equipos)
-- =====================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: equipment (Equipos completos del PDF)
-- =====================================================
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT,
  model TEXT,
  description TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  price_per_day INTEGER NOT NULL,
  price_per_week INTEGER,
  status equipment_status DEFAULT 'available',
  image_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: quotes (Cotizaciones)
-- =====================================================
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  comments TEXT,
  total_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: quote_items (Items de cotización)
-- =====================================================
CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  equipment_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  days INTEGER NOT NULL DEFAULT 1,
  price_per_day INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: contact_info (Información de contacto)
-- =====================================================
CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  instagram TEXT,
  facebook TEXT,
  quote_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FUNCIONES DE SEGURIDAD
-- =====================================================

-- Función para verificar roles (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para crear perfil al registrarse
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para categories (público read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para equipment (público read, admin write)
CREATE POLICY "Equipment is viewable by everyone"
  ON public.equipment FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage equipment"
  ON public.equipment FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para quotes
CREATE POLICY "Users can view their own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quotes"
  ON public.quotes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quotes"
  ON public.quotes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para quote_items
CREATE POLICY "Users can view their own quote items"
  ON public.quote_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quote items"
  ON public.quote_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all quote items"
  ON public.quote_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para contact_info (público read, admin write)
CREATE POLICY "Contact info is viewable by everyone"
  ON public.contact_info FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage contact info"
  ON public.contact_info FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_equipment_category ON public.equipment(category_id);
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_featured ON public.equipment(featured);
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX idx_quote_items_equipment_id ON public.quote_items(equipment_id);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar información de contacto
INSERT INTO public.contact_info (whatsapp, email, phone, address, quote_message)
VALUES (
  '5491147180732',
  'info@alanortecinedigital.com',
  '+54 (11) 4718-0732',
  'V. S. de Liniers 1565 - Vte. Lopez',
  'Envianos tu proyecto y te armamos un presupuesto personalizado'
);

-- Insertar categorías principales
INSERT INTO public.categories (name, name_en, slug, description, icon, order_index) VALUES
('Cámaras', 'Cameras', 'cameras', 'Cámaras profesionales de cine digital', 'Camera', 1),
('Lentes', 'Lenses', 'lenses', 'Ópticas y lentes profesionales', 'Focus', 2),
('Iluminación', 'Lighting', 'lighting', 'Equipos de iluminación profesional', 'Lightbulb', 3),
('Sonido', 'Audio', 'audio', 'Equipos de audio y sonido', 'Mic', 4),
('Grip', 'Grip', 'grip', 'Grúas, sliders y soportes', 'Move', 5),
('Accesorios', 'Accessories', 'accessories', 'Accesorios y periféricos', 'Wrench', 6);

-- Insertar equipos desde el PDF de lista de precios (precios en pesos argentinos)
-- CÁMARAS
INSERT INTO public.equipment (name, name_en, category_id, brand, price_per_day, price_per_week, status, tags) VALUES
('Cámara GoPro 7', 'GoPro 7 Camera', (SELECT id FROM categories WHERE slug = 'cameras'), 'GoPro', 35000, 210000, 'available', ARRAY['action', 'compact']),
('Cámara PMW-300K1', 'PMW-300K1 Camera', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 65000, 390000, 'available', ARRAY['broadcast', 'professional']),
('Cámara Red Epic Dragon 6k', 'Red Epic Dragon 6k', (SELECT id FROM categories WHERE slug = 'cameras'), 'RED', 270000, 1620000, 'available', ARRAY['cinema', '6k', 'professional']),
('Cámara Sony A7SII', 'Sony A7SII Camera', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 77000, 462000, 'available', ARRAY['mirrorless', 'fullframe']),
('Cámara Sony A7SIII', 'Sony A7SIII Camera', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 120000, 720000, 'available', ARRAY['mirrorless', 'fullframe', '4k']),
('Cámara Sony F3', 'Sony F3 Camera', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 35000, 210000, 'available', ARRAY['cinema', 'super35']),
('Cámara Sony PXW-FS7', 'Sony PXW-FS7', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 120000, 720000, 'available', ARRAY['cinema', '4k', 'xdcam']),
('Cámara Sony PXW-FS7 M2', 'Sony PXW-FS7 M2', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 120000, 720000, 'available', ARRAY['cinema', '4k', 'xdcam']),
('Cámara XDCAM Sony EX3 HD CINEALTA', 'Sony EX3 HD', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 54000, 324000, 'available', ARRAY['broadcast', 'hd']),
('GoPro Hero 12', 'GoPro Hero 12', (SELECT id FROM categories WHERE slug = 'cameras'), 'GoPro', 76000, 456000, 'available', ARRAY['action', '5.3k']),
('Osmo Plus c/4 baterías', 'Osmo Plus w/4 batteries', (SELECT id FROM categories WHERE slug = 'cameras'), 'DJI', 19000, 114000, 'available', ARRAY['gimbal', 'stabilizer']),
('Sony FX6', 'Sony FX6', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 200000, 1200000, 'available', ARRAY['cinema', '4k', 'fullframe']),
('Sony FX9', 'Sony FX9', (SELECT id FROM categories WHERE slug = 'cameras'), 'Sony', 270000, 1620000, 'available', ARRAY['cinema', '6k', 'fullframe']);

-- Equipos continuará en siguiente bloque...