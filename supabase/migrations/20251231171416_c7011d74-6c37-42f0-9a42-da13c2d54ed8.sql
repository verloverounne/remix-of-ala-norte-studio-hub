-- Create design_tokens table for managing design system tokens
CREATE TABLE public.design_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  value text NOT NULL,
  description text,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Enable RLS
ALTER TABLE public.design_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage tokens
CREATE POLICY "Admins can manage design tokens"
ON public.design_tokens
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Tokens are viewable by admins only
CREATE POLICY "Admins can view design tokens"
ON public.design_tokens
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_design_tokens_updated_at
  BEFORE UPDATE ON public.design_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial tokens

-- Colors
INSERT INTO public.design_tokens (name, type, value, description, category) VALUES
('color.primary', 'color', '#FF6600', 'Color principal de la marca', 'colors'),
('color.secondary', 'color', '#6633FF', 'Color secundario', 'colors'),
('color.background', 'color', '#0B0B0B', 'Fondo principal', 'colors'),
('color.surface', 'color', '#151515', 'Superficie de tarjetas', 'colors'),
('color.text', 'color', '#FFFFFF', 'Color de texto principal', 'colors'),
('color.muted', 'color', '#999999', 'Texto secundario/muted', 'colors');

-- Typography
INSERT INTO public.design_tokens (name, type, value, description, category) VALUES
('font.family.base', 'font-family', 'Inter, system-ui, sans-serif', 'Familia tipográfica base', 'typography'),
('font.size.body', 'font-size', '16px', 'Tamaño de texto body', 'typography'),
('font.size.h1', 'font-size', '40px', 'Tamaño H1', 'typography'),
('font.size.h2', 'font-size', '32px', 'Tamaño H2', 'typography'),
('font.size.h3', 'font-size', '24px', 'Tamaño H3', 'typography'),
('lineHeight.body', 'line-height', '1.5', 'Interlineado del body', 'typography');

-- Spacing
INSERT INTO public.design_tokens (name, type, value, description, category) VALUES
('space.4', 'spacing', '4px', 'Espaciado mínimo', 'spacing'),
('space.8', 'spacing', '8px', 'Espaciado pequeño', 'spacing'),
('space.12', 'spacing', '12px', 'Espaciado pequeño-medio', 'spacing'),
('space.16', 'spacing', '16px', 'Espaciado base', 'spacing'),
('space.24', 'spacing', '24px', 'Espaciado medio', 'spacing'),
('space.32', 'spacing', '32px', 'Espaciado grande', 'spacing');

-- Radius
INSERT INTO public.design_tokens (name, type, value, description, category) VALUES
('radius.sm', 'radius', '4px', 'Borde redondeado pequeño', 'radius'),
('radius.md', 'radius', '8px', 'Borde redondeado medio', 'radius'),
('radius.lg', 'radius', '16px', 'Borde redondeado grande', 'radius'),
('radius.full', 'radius', '999px', 'Borde completamente redondeado', 'radius');

-- Shadows & Motion
INSERT INTO public.design_tokens (name, type, value, description, category) VALUES
('shadow.card', 'shadow', '0 8px 24px rgba(0,0,0,0.3)', 'Sombra para tarjetas', 'shadows'),
('transition.fast', 'transition', '150ms ease-out', 'Transición rápida', 'shadows'),
('transition.default', 'transition', '250ms ease-out', 'Transición por defecto', 'shadows');

-- Layout & Grid
INSERT INTO public.design_tokens (name, type, value, description, category) VALUES
('breakpoint.desktop', 'breakpoint', '1440', 'Breakpoint desktop (px)', 'layout'),
('breakpoint.tablet', 'breakpoint', '768', 'Breakpoint tablet (px)', 'layout'),
('breakpoint.mobile', 'breakpoint', '390', 'Breakpoint mobile (px)', 'layout'),
('grid.desktop.columns', 'grid', '12', 'Columnas grid desktop', 'layout'),
('grid.tablet.columns', 'grid', '8', 'Columnas grid tablet', 'layout'),
('grid.mobile.columns', 'grid', '4', 'Columnas grid mobile', 'layout'),
('grid.desktop.gap', 'grid', '24', 'Gap grid desktop (px)', 'layout'),
('grid.tablet.gap', 'grid', '20', 'Gap grid tablet (px)', 'layout'),
('grid.mobile.gap', 'grid', '16', 'Gap grid mobile (px)', 'layout'),
('container.desktop.maxWidth', 'container', '1200', 'Max width container desktop (px)', 'layout'),
('container.tablet.maxWidth', 'container', '720', 'Max width container tablet (px)', 'layout'),
('container.mobile.maxWidth', 'container', '360', 'Max width container mobile (px)', 'layout');