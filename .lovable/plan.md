# Auto-asignar subcategoría por equipos similares (Rentalos sync)

## Problema
En `RentalosSyncPanel.tsx`, cuando una fila del CSV tiene una `categoria` que no está en `CATEGORY_MAP` (o está vacía), el equipo se crea/actualiza **sin** `subcategory_id` (y a veces sin `category_id`), salvo el fallback duro de "sonido". Resultado: equipos huérfanos en el listado del rental.

## Objetivo
Cuando no haya match directo de subcategoría desde el CSV, **inferirla a partir de equipos similares ya existentes en la base** (que sí tengan `subcategory_id`).

## Estrategia de similitud (en orden, primer match gana)

Para cada equipo sin subcategoría resuelta:

1. **Marca + modelo exactos**: buscar en `equipment` existente otro registro cuyo `brand`+`model` (normalizados) coincidan y tenga `subcategory_id`. Heredar esa subcategoría.
2. **Marca + primer token del modelo**: ej. "Aputure 600D Pro" → matchea con "Aputure 600x Pro" si comparten "Aputure" + "600".
3. **Tokens significativos del nombre normalizado**: tokenizar el `name` (quitando stopwords como "de", "kit", "para", números sueltos), y buscar el equipo existente que comparta más tokens (≥2) y tenga subcategoría. Elegir la subcategoría más frecuente entre los top matches.
4. **Fallback final**: si nada matchea, dejar el equipo como hoy (sin subcategoría) y registrarlo en el log/errores como "⚠ sin subcategoría inferible".

Si el match aporta subcategoría, también se asigna su `category_id` (consistencia).

## Cambios en código

Archivo único: `src/components/admin/RentalosSyncPanel.tsx`

1. Ampliar el SELECT de equipos existentes para traer `brand, model, subcategory_id, category_id` además de lo actual.
2. Construir, después del fetch, un índice en memoria de equipos **con subcategoría asignada**:
   - Map por `brand|model` normalizados.
   - Map por `brand|modelPrefix`.
   - Lista tokenizada `{tokens, subcategory_id, category_id}` para el fuzzy.
3. Nueva función `inferSubcategoryFromSimilar(name, brand?, model?)` que devuelve `{ subcategory_id, category_id } | null` aplicando los 3 niveles.
4. En el loop de sync, si `subcatInfo` es null y tampoco aplica el fallback "sonido", llamar a `inferSubcategoryFromSimilar` con el nombre/brand/model derivados del CSV (brand/model no vienen en el CSV — se derivan del nombre por heurística simple: primer token = brand, segundo = model).
5. Si se infiere, setear `updateFields.subcategory_id` y `category_id`, y agregar a `syncResult.details` un mensaje "↪ Inferido por similitud: {nombre} → {subcategoría}".
6. Actualizar el bloque de "¿Qué hace exactamente esta sincronización?" en el card para describir el nuevo paso.

## Detalles técnicos

- Normalización reutiliza `normalizeName` existente.
- Stopwords mínimas en castellano/inglés: `["de","del","la","el","para","con","kit","set","pack","tipo","modelo"]`.
- Umbral fuzzy: mínimo 2 tokens compartidos de ≥3 chars; si empate, gana la subcategoría con más ocurrencias entre los matches.
- Todo en memoria, sin queries extra por equipo (rendimiento).
- No toca: imágenes, specs, featured, lógica de stock/status/ownership.

## Validación
- Probar con el CSV actual: contar cuántos equipos quedan sin subcategoría antes vs después, visible en el log del panel.
- Revisar manualmente algunos casos inferidos desde el listado de rental.
