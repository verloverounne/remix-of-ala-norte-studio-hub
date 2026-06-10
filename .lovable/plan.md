## Objetivo
Reemplazar el buscador custom de `src/pages/Equipos.tsx` (Levenshtein + subsequence manual) por **Fuse.js**, igual que el `SearchBar` del header, para tener búsqueda difusa real tolerante a errores tipográficos.

## Cambios en `src/pages/Equipos.tsx`

1. **Importar Fuse**: `import Fuse from "fuse.js";` (ya está instalado, lo usa el header).
2. **Eliminar** `fuzzyMatch` y `levenshteinDistance` (líneas 121-158).
3. **Crear instancia memoizada de Fuse** sobre el `equipment` ya filtrado por `status === "available"`, con las mismas opciones que el header para que el comportamiento sea idéntico:
   ```ts
   const fuse = useMemo(() => new Fuse(availableEquipment, {
     keys: ["name", "brand", "model", "description"],
     threshold: 0.45,
     ignoreLocation: true,
     minMatchCharLength: 2,
     includeScore: true,
   }), [availableEquipment]);
   ```
4. **Reescribir `filteredEquipment`**: 
   - Si `searchTerm.trim().length < 2` → devolver todos los disponibles (aplicando solo el filtro de subcategoría).
   - Si hay búsqueda → `fuse.search(searchTerm)` ordenado por score, mapear a items, y luego aplicar el filtro de subcategoría seleccionada.
5. **Preservar el resto del comportamiento** ya existente:
   - Cuando hay búsqueda activa, ignorar la categoría seleccionada y mostrar resultados de todas las categorías (igual que ahora).
   - `subcategoriesWithResults`, `categoriesWithResults`, agrupado "Otros" y orden de tarjetas se siguen calculando a partir de `filteredEquipment`, sin cambios.
   - `searchTerm` sigue siendo controlado por el input existente; no se toca el UI.

## Notas técnicas
- Mismo umbral (`threshold: 0.45`) e `ignoreLocation` que el header → tolerancia a errores y matches en cualquier parte del texto.
- `minMatchCharLength: 2` evita ruido con 1 sola letra (el input ya muestra todo cuando hay <2 chars).
- Se respeta la regla de visibilidad pública: solo equipos con `status === "available"` entran al índice.
- No se modifica `SearchBar.tsx` ni ningún otro componente.

## Fuera de alcance
- No tocar el panel admin ni el header.
- No cambiar el diseño del input de búsqueda en Equipos.