## Objetivo

Hacer una limpieza profunda del proyecto en dos frentes:
1. **Código**: eliminar archivos, componentes, hooks, datos estáticos y dependencias que no se usan.
2. **Storage / Base de datos**: eliminar imágenes y videos del bucket `equipment-images` (y otros) que ya no estén referenciados por ninguna tabla ni por el código.

---

## Fase 1 — Auditoría de código muerto

Recorrer el proyecto y detectar:

- Componentes en `src/components/` sin imports (ej. candidatos a revisar: `InstitutionalSlider`, `ProductionsSlider`, `GalleryHero`, `Map`, `SearchBar`, `EquipmentImageManager`, `EquipmentImageUploader`, `ImageUploader`, `StorageImageSelector`, `MergeEquipment`, etc.).
- Páginas en `src/pages/` no enrutadas en `App.tsx`.
- Hooks en `src/hooks/` sin consumidores.
- Archivos en `src/data/` y `src/lib/` no importados (ej. `mockData.ts`, `galleryData.ts` si no se usan).
- Imports no utilizados dentro de archivos que sí se conservan.
- Bloques comentados grandes (ej. el toggle de vistas comentado en `Viewer360.tsx`).
- Archivos sueltos en la raíz que parecen notas (`BORDES_RENTAL.md`, `EQUIPOS_SIN_IMAGEN.txt`, `.lovable/plan.md`) — confirmar con vos si se borran.
- Dependencias de `package.json` que quedaron huérfanas tras la limpieza (`bun remove`).

Herramientas: `rg` para buscar referencias, revisión cruzada con `App.tsx` y entry points.

## Fase 2 — Auditoría de Storage

Para cada bucket (`equipment-images`, `images`, `publicimages`, `servicios`):

1. Listar todos los objetos del bucket.
2. Recolectar todas las URLs/paths referenciados en:
   - Tablas: `equipment.image_url` + `equipment.images` (jsonb), `equipment_images.image_url`, `spaces.video_url` + `featured_image` + `images` + `tour_360_url`, `gallery_images.image_url` + `vertical_video_url`, `home_services.*_url`, `services_hero.hero_media_url`, `service_sections`, `equipos_hero_config.media_url`, `blog_articles.image_url`.
   - Código: archivos en `src/` con URLs hardcodeadas de Supabase Storage (ej. `src/data/spaces.ts`, `src/data/featuredEquipment.ts`, `Viewer360.tsx` con `363.jpg`).
3. Diferencia = archivos huérfanos candidatos a borrar.

## Fase 3 — Ejecución segura

1. Generar un **reporte previo** en `/mnt/documents/cleanup-report.md` con:
   - Lista exacta de archivos de código a eliminar.
   - Lista exacta de objetos de storage a eliminar (con tamaño total a liberar).
   - Dependencias npm a remover.
2. **Pedir tu confirmación** sobre el reporte antes de borrar nada.
3. Una vez aprobado:
   - Borrar archivos de código + ajustar imports.
   - Borrar objetos de storage vía API admin.
   - Correr `bun remove` para dependencias huérfanas.
   - Verificar que el build siga pasando.

---

## Preguntas antes de avanzar

1. ¿Borro también los archivos sueltos de la raíz (`BORDES_RENTAL.md`, `EQUIPOS_SIN_IMAGEN.txt`)?
2. Para storage: ¿borro definitivamente los huérfanos, o preferís que primero te entregue **solo el reporte** y vos decidís cuáles van?
3. ¿Querés que toque también el bucket privado `images` o lo dejo intacto por las dudas?
