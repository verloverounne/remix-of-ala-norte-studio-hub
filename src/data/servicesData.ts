/**
 * Static home services data - extracted from database to avoid cloud queries.
 * To update: query home_services table (is_active=true, order by order_index) and replace.
 * Last updated: 2026-02-20
 */

export interface StaticHomeService {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  hero_media_type: string | null;
  hero_video_url: string | null;
  section_media_type: string | null;
  section_video_url: string | null;
  button_text: string | null;
  button_link: string | null;
  bullets: string[];
  cta_label: string | null;
  cta_url: string | null;
  slug: string | null;
  order_index: number;
  is_active: boolean;
}

export const STATIC_HOME_SERVICES: StaticHomeService[] = [
  {
    id: "785da322-50a4-4400-bdd7-f099fc159ba7",
    title: "Multicámara y móvil HD",
    description:
      "Coordinamos producciones multicámara con unidades móviles equipadas en alta definición. Ya sea para eventos en vivo, streaming o contenido multipantalla, armamos el operativo técnico y te acompañamos en todo el proceso de captura.",
    image_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768795408801_ACNUR_CONCIERTO.mp4",
    hero_image_url: null,
    hero_media_type: "video",
    hero_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//multicamara.mp4",
    section_media_type: "video",
    section_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//multicamara.mp4",
    button_text: null,
    button_link: null,
    bullets: [],
    cta_label: "Contactanos",
    cta_url: "/contacto",
    slug: "multicmara-y-mvil-hd",
    order_index: 0,
    is_active: true,
  },
  {
    id: "bafcb89c-9a4f-4c41-9569-3f33c057785c",
    title: "Técnicos",
    description:
      "Sumanos a tu equipo técnico!\Directores de fotografía, operadores de cámara (steadycam, grúa), sonidistas o coordinadores técnicos. Si necesitás completar el equipo con otros profesionales, también te ayudamos con eso.",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//tecnicos.mp4",
    hero_image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//tecnicos.mp4",
    hero_media_type: "video",
    hero_video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//tecnicos.mp4",
    section_media_type: "video",
    section_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//tecnicos.mp4",
    button_text: null,
    button_link: null,
    bullets: [
      "Dirección de fotografía",
      "Operación de cámara y movimiento (steadycam, grúa)",
      "Sonido directo",
      "Coordinación técnica",
      "Contacto con otros profesionales del rubro",
    ],
    cta_label: "Contactanos",
    cta_url: "/contacto",
    slug: "servicios-tecnicos-en-rodaje",
    order_index: 1,
    is_active: true,
  },
  {
    id: "645c5ca7-3c92-40c8-9b4b-0c52ca579c29",
    title: "Galería",
    description:
      "Espacios versátiles y completamente equipados para tus producciones. Ciclorama, sets modulares y control total de iluminación.",
    image_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768795867738_GALERIA_FAKENEWS.mp4",
    hero_image_url: null,
    hero_media_type: "video",
    hero_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768955828513_GALERIA_FAKENEWS_2.mp4",
    section_media_type: "video",
    section_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768874645246_GALERIA_FAKENEWS_1.mp4",
    button_text: null,
    button_link: null,
    bullets: [],
    cta_label: "Descubrila",
    cta_url: "/galeria",
    slug: "galera-de-filmacin",
    order_index: 2,
    is_active: true,
  },
  {
    id: "af28b17b-e012-4b16-8b73-dc94bbab9fef",
    title: "Equipos",
    description:
      "Equipos de primera línea. Mantenemos, probamos y ponemos a punto cada pieza. Cuidamos cada detalle porque sabemos que detrás de cada rodaje hay una historia por contar.",
    image_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//1768956131991_rental_vertical.mp4",
    hero_image_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//1768956131991_rental_vertical.mp4",
    hero_media_type: "video",
    hero_video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//tecnicos.mp4",
    section_media_type: "video",
    section_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//tecnicos.mp4",
    button_text: null,
    button_link: null,
    bullets: [
      "Nuestro inventario está curado para productores exigentes, creativos y realizadores independientes. Mantenemos, probamos y asesoramos en cada paso, armando el kit perfecto para tu idea.",
    ],
    cta_label: "Explorá el catálogo",
    cta_url: "/equipos",
    slug: "inventario-curado-de-equipos",
    order_index: 3,
    is_active: true,
  },
  {
    id: "88db73ab-e156-44f2-88d7-b1ebf12b9d42",
    title: "Sala de Sonido",
    description:
      "Suites de post-producción con estaciones de trabajo profesionales, monitoreo calibrado y ambiente acústico controlado.",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
    hero_image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
    hero_media_type: "image",
    hero_video_url: null,
    section_media_type: "image",
    section_video_url: null,
    button_text: null,
    button_link: null,
    bullets: [],
    cta_label: "Conocé los detalles",
    cta_url: "/sala-grabacion",
    slug: "sala-de-sonido-y-postproduccion-",
    order_index: 4,
    is_active: true,
  },
  {
    id: "244d543c-51a1-4baa-b17a-3279d020f5b2",
    title: "Escuela Ala Norte",
    description:
      "Workshops, masterclasses y eventos para profesionales. Un espacio de encuentro y crecimiento para la comunidad audiovisual.",
    image_url: null,
    hero_image_url: null,
    hero_media_type: "video",
    hero_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//TALLER CAMARA.mp4",
    section_media_type: "video",
    section_video_url:
      "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//TALLER CAMARA.mp4",
    button_text: null,
    button_link: null,
    bullets: [],
    cta_label: null,
    cta_url: null,
    slug: "formacin-y-comunidad",
    order_index: 5,
    is_active: true,
  },
];
