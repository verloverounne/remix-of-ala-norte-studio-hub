
# Plan: Ordenamiento y Subcategorías Colapsables

## Resumen de Cambios

1. **Eliminar "Por subcategoría" de opciones de orden** - Las otras opciones (alfabético, precio) ahora respetarán siempre el agrupamiento por subcategorías
2. **Subcategorías siempre colapsadas por defecto** - A menos que estén seleccionadas en el filtrado

---

## Cambios en Archivos

### 1. `src/pages/Equipos.tsx`

**Cambios:**
- Eliminar `"subcategory"` del tipo `SortOption`
- Cambiar valor por defecto de `sortOption` a `"alphabetic"`
- Eliminar la opción "Por subcategoría" del dropdown de ordenamiento
- Modificar la lógica de ordenamiento para que **siempre** ordene primero por subcategoría (order_index) y luego aplique el orden secundario seleccionado

**Lógica de ordenamiento actualizada:**
```typescript
type SortOption = "alphabetic" | "price-asc" | "price-desc";

// Siempre ordenar por subcategoría primero, luego por la opción seleccionada
sorted.sort((a, b) => {
  const subA = subcategories.find(s => s.id === a.subcategory_id);
  const subB = subcategories.find(s => s.id === b.subcategory_id);
  const orderA = subA?.order_index ?? 999;
  const orderB = subB?.order_index ?? 999;
  
  // Primero ordenar por subcategoría
  if (orderA !== orderB) return orderA - orderB;
  
  // Luego aplicar orden secundario
  switch (sortOption) {
    case "alphabetic":
      return a.name.localeCompare(b.name);
    case "price-asc":
      return (a.price_per_day || 0) - (b.price_per_day || 0);
    case "price-desc":
      return (b.price_per_day || 0) - (a.price_per_day || 0);
  }
});
```

---

### 2. `src/components/rental/CategorySection.tsx`

**Cambios:**
- Eliminar `sortOption` de la lógica condicional (siempre mostrar cabeceras de subcategoría)
- Pasar `selectedSubcategories` al componente `CollapsibleSubcategory`
- Determinar si una subcategoría debe estar expandida basándose en si está seleccionada en el filtro

**Lógica de expansión:**
```typescript
// Una subcategoría está expandida si:
// 1. No hay filtros activos (selectedSubcategories está vacío), o
// 2. Esta subcategoría específica está en la lista de filtros seleccionados
const isSubcategoryExpanded = selectedSubcategories.length === 0 
  ? false  // Sin filtros = todas colapsadas
  : selectedSubcategories.includes(group.subcategory?.id || "");
```

---

### 3. `src/components/rental/CollapsibleSubcategory.tsx`

**Cambios:**
- Cambiar `defaultExpanded` a `false` por defecto
- El componente sigue funcionando igual, solo cambia el valor inicial

---

## Comportamiento Final

| Escenario | Estado de subcategorías |
|-----------|-------------------------|
| Sin filtros activos | Todas colapsadas |
| Filtro "Lentes" activo | Solo "Lentes" expandida |
| Filtros "Lentes" + "Cámaras" | Ambas expandidas |

| Opción de orden | Comportamiento |
|-----------------|----------------|
| Alfabético | Por subcategoría → luego A-Z |
| Precio ↑ | Por subcategoría → luego menor a mayor |
| Precio ↓ | Por subcategoría → luego mayor a menor |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/Equipos.tsx` | Eliminar opción subcategoría, actualizar lógica de sort |
| `src/components/rental/CategorySection.tsx` | Siempre mostrar headers, pasar estado de expansión |
| `src/components/rental/CollapsibleSubcategory.tsx` | Cambiar defaultExpanded a false |
