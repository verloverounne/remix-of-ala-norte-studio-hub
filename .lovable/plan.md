## Objetivo

Hacer del CSV de Rentalos (`equipos_2026-07-17.csv`, 1215 equipos) la única fuente de verdad, garantizar que ningún equipo del CSV falte en la página, y limpiar la base actual dejando solo los equipos que tienen imagen.

## Estado actual (verificado)

- Base actual: 592 equipos.
- Con alguna imagen (image_url, images[] o equipment_images): 97.
- Sin imagen: 495.
- CSV Rentalos 2026-07-17: 1215 filas con columnas `Nombre;Categoria;PrecioDiario;NumeroSerie;Anexos;Cantidad;Funcional;Tipo`.

## Cambios

### 1. Limpieza previa de Ala Norte
Borrar de `equipment` los 495 registros sin ninguna imagen (ni `image_url`, ni `images[]`, ni fila en `equipment_images`). Quedan los 97 con imagen.

### 2. Re-importar el CSV de Rentalos como fuente de verdad
Modificar `src/components/admin/RentalosSyncPanel.tsx` y ejecutar la sync con el CSV nuevo:

- Match por nombre normalizado (`toLowerCase().trim()` + colapso de espacios), igual que hoy.
- `Tipo = Externo` → borrar de la base si existe, no insertar.
- `Funcional = No` (o stock efectivo 0) → conservar/insertar con `status = 'maintenance'`.
- **Subcategoría siempre desde el CSV** (deja de respetar `subcategory_manually_edited` y `manual_category_id`):
  1. Mapeo directo `KEYWORD_RULES` + `CATEGORY_DIRECT_MAP` de `rentalosImportRules.ts`.
  2. Si no resuelve, fallback por categoría del CSV (`CATEGORY_FALLBACK_MAP`).
  3. Si tampoco resuelve, asignar la subcategoría "Otros" (o `Varios`) de la categoría del CSV; crear esas subcategorías si faltan. Nunca dejar sin subcategoría un equipo del CSV.
- Precio (`price_per_day`), `stock_quantity` (Cantidad), `sku_rentalos` (NumeroSerie), `tipo_equipo` (Tipo) siempre pisados con el valor del CSV.
- Insertar todos los equipos del CSV que no existan tras el paso 1, aplicando las mismas reglas. Objetivo: 0 equipos del CSV faltantes al terminar.
- Borrar de la base cualquier equipo que no esté en el CSV Rentalos y que no haya quedado ya limpio en el paso 1 (por consistencia con "fuente de verdad").

### 3. Ajustes de UI/flags
- Marcar todos los registros sincronizados como `subcategory_auto_assigned = true`, `category_manually_edited = false`, `subcategory_manually_edited = false` (Rentalos manda).
- Mantener el panel "Autoasignados" para revisar los que cayeron al fallback "Otros/Varios".

### 4. Ejecutar la sync
Con el panel corregido, correr la importación del `equipos_2026-07-17.csv` desde Admin y verificar en DB:
- Total = 1215 − (cantidad de Externos del CSV).
- 0 equipos del CSV ausentes.
- 0 equipos sin `subcategory_id`.

## Detalles técnicos

- Archivos a editar: `src/components/admin/RentalosSyncPanel.tsx`, `src/components/admin/rentalosImportRules.ts` (extender fallback a "Otros/Varios" por categoría).
- Migración: crear subcategorías `Otros` que falten por cada categoría base (Cámara, Iluminación, Sonido, Grip, Energía, Accesorios, etc.).
- Borrados del paso 1 y 2 vía `insert`/`delete` tool con SQL directo, previos a correr el panel.
- El flag "preservar subcategoría manual" queda desactivado por decisión explícita del usuario; las ediciones manuales previas se pierden.
