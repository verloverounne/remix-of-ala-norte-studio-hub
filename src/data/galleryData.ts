/**
 * Static gallery images data - extracted from database to avoid cloud queries on every page load.
 * To update: query gallery_images table and replace this data.
 * Last updated: 2026-02-20
 */

export interface StaticGalleryImage {
  id: string;
  page_type: string;
  image_url: string;
  media_type: string | null;
  vertical_video_url: string | null;
  title: string | null;
  description: string | null;
  order_index: number | null;
}

export const STATIC_GALLERY_IMAGES: StaticGalleryImage[] = [
  {
    id: "2fe9e08b-3f72-42f1-b431-725e57660144",
    page_type: "galeria",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1767902731672_editada_fondo_blanco_45_grados.jpg",
    media_type: "image",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: -1,
  },
  {
    id: "4bded1b8-862e-4088-92f2-67091fed982c",
    page_type: "home_hero",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//1768955781959_hero_rental.mp4",
    media_type: "video",
    vertical_video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//1768955781959_hero_rental.mp4",
    title: "ALA NORTE, MAS QUE UN RENTAL",
    description: "Tu socio en cada producción. Ofrecemos trato humano, asesoría técnica dedicada y equipamiento curado para que tu proyecto llegue a set como lo imaginaste.",
    order_index: 0,
  },
  {
    id: "33f17c26-5ff1-449a-b501-4a75f2ee9c5a",
    page_type: "servicios",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768056218104_rental.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 0,
  },
  {
    id: "2f23dab4-4080-4fa4-869e-2a0f739993be",
    page_type: "cartoni_home",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768790824626_stop.motion_1.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 0,
  },
  {
    id: "7847b58a-68e1-4e10-8162-8e0d25b9e0fa",
    page_type: "contacto",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768878577431_entrada_alanorte_vereda.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 0,
  },
  {
    id: "8f9a68d2-cd3e-4502-8267-c2e142262d37",
    page_type: "galeria",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1767902538317_galeria_croma_verd3.jpg",
    media_type: "image",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 0,
  },
  {
    id: "60f4be2f-e38f-4eb4-9018-d50fddd711b9",
    page_type: "home_hero",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//GALERIA FAKENEWS_3.mp4",
    media_type: "video",
    vertical_video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//GALERIA FAKENEWS_3.mp4",
    title: "GALERÍA ALA NORTE",
    description: "Un espacio pensado para quienes buscan más que un set: comodidad, flexibilidad y apoyo profesional. Reservas por bloques de 4hs para tu producción.",
    order_index: 1,
  },
  {
    id: "f869772f-ba9e-45be-b024-92289d7d529b",
    page_type: "galeria",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1767902564017_di2.jpg",
    media_type: "image",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 1,
  },
  {
    id: "e184ff9c-83ab-4ed6-9b15-4bd6c67e89b8",
    page_type: "hero_rental",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951063587_sonido.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 1,
  },
  {
    id: "c670b537-7bb3-4e4a-9062-a622fca53883",
    page_type: "galeria_hero",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768673990346_gente.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 1,
  },
  {
    id: "8022a048-ace3-4164-9869-fafd342ef9ad",
    page_type: "hero_rental",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951104500_camara_fondo_blanco_gonzalo.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 2,
  },
  {
    id: "9da67e06-5324-4546-a897-9346716a4b61",
    page_type: "home_hero",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
    media_type: "video",
    vertical_video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
    title: "SALA DE SONIDO",
    description: "Suite de locución y postproducción con ProTools Ultimate / edición y color con DaVinci Resolve en un ambiente cálido y confiable.",
    order_index: 2,
  },
  {
    id: "37cfb66b-3935-4ee4-b2c9-e566bc0c5b38",
    page_type: "galeria",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1767902578351_galeria_croma_verd_mas_otro_escenario_en_star3.jpg",
    media_type: "image",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 2,
  },
  {
    id: "97c38510-5436-4a73-ac07-35da01066048",
    page_type: "hero_rental",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951451525_luces.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 3,
  },
  {
    id: "f3a88ee2-01fb-4933-a023-381f501c2a8c",
    page_type: "hero_rental",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951477713_grips.mp4",
    media_type: "video",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 4,
  },
  {
    id: "69cfb9f4-dcee-4159-867c-8cb6ca9642d3",
    page_type: "galeria",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1767902782658_star_de_galeria.jpg",
    media_type: "image",
    vertical_video_url: null,
    title: null,
    description: null,
    order_index: 4,
  },
];

/** Get gallery images filtered by page type, sorted by order_index */
export function getStaticByPageType(pageType: string): StaticGalleryImage[] {
  return STATIC_GALLERY_IMAGES
    .filter((img) => img.page_type === pageType)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
}
