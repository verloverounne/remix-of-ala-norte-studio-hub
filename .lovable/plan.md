
# Plan de Optimización del Sitio

## Resumen de Cambios

Implementaré las optimizaciones aprobadas, conservando `SubcategoryFilter.tsx` como solicitaste.

---

## Paso 1: Crear Archivo de Datos Estáticos

**Nuevo archivo:** `src/data/spaces.ts`

Contendrá los datos completos de ambos espacios extraídos de la base de datos:

**GALERIA_SPACE:**
- hero_title: "GALERÍA ALA NORTE"
- hero_subtitle: "BLOQUES DE 4HS PARA TU PRODUCCIÓN AUDIOVISUAL"
- video_url: URL del video hero
- features: 5 características (tiro de cámara, infinitos, chroma)
- included_items: 6 items (fresneles, tubos, infinitos)
- optional_services: 6 servicios adicionales
- Horarios, precios, layout_description, etc.

**SALA_GRABACION_SPACE:**
- hero_title: "Sala de grabación y edición"
- hero_subtitle: "ISLA DE POSTPRODUCCIÓN PROFESIONAL DE AUDIO Y VIDEO"
- features: 4 características (acústica, iluminación, clima, aislamiento)
- included_items: 4 items (consola, monitores, micrófonos, interfaz)
- optional_services: 4 servicios
- Horarios, precios, layout_description, etc.

---

## Paso 2: Modificar Galeria.tsx

Cambios:
- Eliminar import de `supabase`
- Eliminar `useState` para `space` y `loading`
- Eliminar `useEffect` con `fetchData()`
- Importar `GALERIA_SPACE` desde `@/data/spaces`
- Usar el espacio estático directamente
- Mantener `useGalleryImages` para imágenes del slider (ya cacheado)

---

## Paso 3: Modificar SalaGrabacion.tsx

Mismos cambios que Galería:
- Eliminar import de `supabase`
- Eliminar `useState`/`useEffect`
- Importar `SALA_GRABACION_SPACE` desde `@/data/spaces`
- Usar datos estáticos

---

## Paso 4: Optimizar Contacto.tsx

- Eliminar import de `supabase`
- Eliminar `useEffect` con query directa
- Usar hook `useGalleryImages` (cache 24h) en su lugar:
```typescript
const { getByPageType } = useGalleryImages();
const contactoMedia = getByPageType("contacto");
```

---

## Paso 5: Eliminar Componentes No Utilizados

**8 archivos a eliminar** (conservando SubcategoryFilter.tsx):

| Archivo | Razón |
|---------|-------|
| `src/components/BulkImageAssigner.tsx` | Sin imports |
| `src/components/SpaceModal.tsx` | Reemplazado por páginas dedicadas |
| `src/components/SpaceAvailabilityCalendar.tsx` | Solo usado por SpaceModal |
| `src/components/AvailabilityCalendar.tsx` | Sin imports |
| `src/components/rental/QuoteSidebar.tsx` | Reemplazado por CartSidebar |
| `src/components/VideoHeroSlider.tsx` | Reemplazado por HomeVideoHeroSlider |
| `src/components/admin/ComponentsDownloadPanel.tsx` | Sin imports |
| `src/components/admin/HomeServicesPanel.tsx` | Sin imports |

---

## Resumen de Archivos

| Acción | Archivo |
|--------|---------|
| Crear | `src/data/spaces.ts` |
| Modificar | `src/pages/Galeria.tsx` |
| Modificar | `src/pages/SalaGrabacion.tsx` |
| Modificar | `src/pages/Contacto.tsx` |
| Eliminar | 8 componentes no utilizados |

---

## Impacto en Rendimiento

| Métrica | Antes | Después |
|---------|-------|---------|
| Queries Cloud /galeria | 1 | 0 |
| Queries Cloud /sala-grabacion | 1 | 0 |
| Queries Cloud /contacto | 1 | 0 (usa cache) |
| Tiempo carga espacios | ~300ms | <10ms |
| Componentes eliminados | 0 | 8 |

---

## Sección Técnica

### Estructura de src/data/spaces.ts

```typescript
import type { Space } from "@/types/supabase";

export const GALERIA_SPACE: Space = {
  id: "ccd3f3dd-6fa3-47be-9f42-9a257fd02253",
  name: "Galería",
  slug: "galeria",
  hero_title: "GALERÍA ALA NORTE",
  hero_subtitle: "BLOQUES DE 4HS PARA TU PRODUCCIÓN AUDIOVISUAL",
  video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/hero_galeria_1768776126818_alanorte_galerias_hero.mp4",
  features: ["11 m de tiro de cámara", "Infinito blanco 6 m x 3 m", ...],
  included_items: ["3 fresneles 1K", "16 tubos", ...],
  // ... resto de campos
};

export const SALA_GRABACION_SPACE: Space = {
  id: "f4af2ff2-c867-406f-b9f0-19d3b1c1fdf1",
  name: "Sala de Grabación / Postproducción",
  slug: "sala-grabacion",
  hero_title: "Sala de grabación y edición",
  hero_subtitle: "ISLA DE POSTPRODUCCIÓN PROFESIONAL DE AUDIO Y VIDEO",
  video_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images//sala.mp4",
  features: ["Tratamiento acústico profesional", ...],
  // ... resto de campos
};

export function getSpaceBySlug(slug: string): Space | null {
  // Helper para obtener espacio por slug
}
```

### Cambios en Galeria.tsx

```typescript
// ANTES
import { supabase } from "@/integrations/supabase/client";
const [space, setSpace] = useState<Space | null>(null);
const [loading, setLoading] = useState(true);
useEffect(() => { fetchData(); }, []);

// DESPUÉS
import { GALERIA_SPACE } from "@/data/spaces";
const space = GALERIA_SPACE; // Uso directo, sin loading
```

### Cambios en Contacto.tsx

```typescript
// ANTES
import { supabase } from "@/integrations/supabase/client";
useEffect(() => {
  const { data } = await supabase.from("gallery_images")...
}, []);

// DESPUÉS
import { useGalleryImages } from "@/hooks/useGalleryImages";
const { getByPageType } = useGalleryImages();
const contactoMedia = getByPageType("contacto");
```
