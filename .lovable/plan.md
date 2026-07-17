## Objetivo
En la página Equipos, reordenar las subcategorías dentro de cada categoría para que aparezcan primero las que contienen equipos con precios más altos.

## Criterio de orden
- Ordenar subcategorías por el **precio máximo (`price_per_day`) del equipo más caro** dentro de cada subcategoría, de mayor a menor.
- Solo se consideran equipos visibles (los ya filtrados por disponibilidad/ownership).
- Equipos con precio 0 o 1000 (considerados "sin precio" según regla del proyecto) se ignoran para el cálculo.
- "Sin subcategoría" queda siempre al final.
- Empates: desempate por precio promedio desc, y luego por `order_index` como fallback estable.

## Alcance
Aplica al listado de equipos en `src/pages/Equipos.tsx` → renderizado dentro de `CategorySection`.

## Cambios técnicos
1. **`src/components/rental/CategorySection.tsx`** — en `groupedBySubcategory()`, reemplazar el `sort` por `order_index` por un sort basado en el precio máximo de los `items` agrupados por cada subcategoría (desc), aplicando el mismo criterio en vistas card y list (ambas usan esta función).
2. **`src/components/SubcategoryFilter.tsx`** *(a confirmar)* — el menú de chips de subcategorías actualmente ordena por `order_index`. Para mantener coherencia con el listado, aplicar el mismo orden por precio máximo desc.

## Fuera de alcance
- No se modifica el orden de las categorías principales.
- No se modifica el PDF export ni la base de datos.
- No se cambia `order_index` almacenado en la DB (el orden es solo de presentación en runtime).

## Pregunta pendiente
¿Aplico el mismo reordenamiento también al menú/chips de subcategorías (`SubcategoryFilter`), o solo al listado de tarjetas dentro de cada categoría?
