import type { Space } from "@/types/supabase";

export const GALERIA_SPACE: Space = {
  id: "ccd3f3dd-6fa3-47be-9f42-9a257fd02253",
  name: "Galería",
  slug: "galeria",
  hero_title: "GALERÍA ALA NORTE",
  hero_subtitle: "BLOQUES DE 4HS PARA TU PRODUCCIÓN AUDIOVISUAL",
  description: "Estudio de 150 m² con infinito blanco, negro y chroma verde incluidos.",
  detailed_description: "Espacio profesional de 150 m² totalmente equipado para producciones audiovisuales de alta calidad.",
  video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/hero_galeria_1768776126818_alanorte_galerias_hero.mp4",
  featured_image: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1767902538317_galeria_croma_verd3.jpg",
  features: [
    "11 m de tiro de cámara",
    "Infinito blanco 6 m de ancho x 3 m de alto",
    "5 m de piso blanco",
    "Infinito negro incluido",
    "Chroma verde 3 x 6 m"
  ],
  included_items: [
    "3 fresneles 1K dimerizables",
    "16 tubos frontal/cenital",
    "2 x 4 tubos laterales",
    "Infinito blanco",
    "Infinito negro",
    "Chroma verde 3x6m"
  ],
  optional_services: [
    "Tablero trifásico",
    "Back up de generador",
    "Pintura",
    "Streaming",
    "Podcast",
    "Equipamiento adicional"
  ],
  layout_description: "El estudio cuenta con depósitos, montacargas, sala de locución, sala de edición/grabación, comedor y acceso vehicular.",
  block_price: 70000,
  block_hours: 4,
  price: 70000,
  schedule_weekday: "Lunes a viernes de 9 a 18 hs",
  schedule_weekend: "Fines de semana y fuera de horario a consultar",
  discount_text: "20% de descuento en equipamiento adicional",
  location: "Florida, Vicente López",
  surface_area: "150 m²",
  cta_text: "RESERVAR BLOQUE",
  status: "available",
  amenities: [],
  images: [],
  specs: {},
  tour_360_url: "/images/360-studio.jpg",
  order_index: 0,
  created_at: "2025-12-30T11:07:08.408442+00:00",
  updated_at: "2026-01-22T15:13:39.701265+00:00",
  promotion: null,
};

export const SALA_GRABACION_SPACE: Space = {
  id: "f4af2ff2-c867-406f-b9f0-19d3b1c1fdf1",
  name: "Sala de Grabación / Postproducción",
  slug: "sala-grabacion",
  hero_title: "Sala de grabación y edición",
  hero_subtitle: "ISLA DE POSTPRODUCCIÓN PROFESIONAL DE AUDIO Y VIDEO",
  description: "Suite acústicamente tratada para locución, podcast, mezcla y postproducción de audio y video.",
  detailed_description: "Espacio acústicamente tratado para grabación de locución, podcast, mezcla y postproducción de audio y video.",
  video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
  featured_image: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
  features: [
    "Tratamiento acústico profesional",
    "Iluminación controlada",
    "Climatización independiente",
    "Aislamiento sonoro"
  ],
  included_items: [
    "Consola de mezcla",
    "Monitores de estudio",
    "Micrófonos profesionales",
    "Interfaz de audio"
  ],
  optional_services: [
    "Técnico de sonido",
    "Masterización",
    "Edición de video",
    "Streaming"
  ],
  layout_description: "Diseñada para profesionales del audio: tratamiento acústico completo, monitoreo calibrado y ambiente controlado. Nuestro equipo técnico está disponible para asesorarte durante toda la sesión.",
  block_price: 70000,
  block_hours: 4,
  price: 70000,
  schedule_weekday: "Lunes a viernes de 9 a 18 hs",
  schedule_weekend: "Consultanos, nos adaptamos a tu calendario de producción.",
  discount_text: "20% de descuento en equipamiento adicional",
  location: "Florida, Vicente López",
  surface_area: "",
  cta_text: "¿Necesitás la sala?",
  status: "available",
  amenities: [],
  images: [],
  specs: {},
  tour_360_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//36-1 3.JPG",
  order_index: 0,
  created_at: "2025-12-30T11:07:08.408442+00:00",
  updated_at: "2026-01-28T19:44:48.44675+00:00",
  promotion: null,
};

export function getSpaceBySlug(slug: string): Space | null {
  if (slug === "galeria") return GALERIA_SPACE;
  if (slug === "sala-grabacion") return SALA_GRABACION_SPACE;
  return null;
}
