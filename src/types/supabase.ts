// Types for Supabase Database
export type EquipmentStatus = 'available' | 'rented' | 'maintenance';

export interface Category {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  name_en: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  brand: string | null;
  model: string | null;
  description: string | null;
  detailed_description: string | null;
  specs: any;
  detailed_specs: any;
  price_per_day: number;
  price_per_week: number | null;
  status: EquipmentStatus;
  image_url: string | null;
  images: string[];
  tags: string[];
  featured: boolean;
  featured_copy: string | null;
  order_index: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  // New columns from CSV import
  sku_rentalos: string | null;
  descripcion_corta_es: string | null;
  descripcion_corta_en: string | null;
  tamano: string | null;
  tipo_equipo: string | null;
  observaciones_internas: string | null;
  id_original: number | null;
}

export interface EquipmentWithCategory extends Equipment {
  categories: Category | null;
  subcategories: Subcategory | null;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  price: number;
  promotion: string | null;
  images: string[];
  amenities: any[];
  specs: any;
  status: 'available' | 'unavailable';
  order_index: number;
  created_at: string;
  updated_at: string;
  // New rental block fields
  hero_title: string | null;
  hero_subtitle: string | null;
  block_price: number | null;
  block_hours: number | null;
  schedule_weekday: string | null;
  schedule_weekend: string | null;
  discount_text: string | null;
  surface_area: string | null;
  features: string[];
  included_items: string[];
  optional_services: string[];
  layout_description: string | null;
  location: string | null;
  featured_image: string | null;
  tour_360_url: string | null;
  cta_text: string | null;
}

export interface Quote {
  id: string;
  user_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_date: string;
  end_date: string;
  comments: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  equipment_id: string | null;
  equipment_name: string;
  quantity: number;
  days: number;
  price_per_day: number;
  subtotal: number;
  created_at: string;
}

export interface ContactInfo {
  id: string;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  quote_message: string | null;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}
