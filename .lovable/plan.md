# Panel admin de equipos: traer el listado completo

## Problema
La base tiene 1107 equipos, pero el panel admin (`EquipmentManager`) muestra solo un lote (Supabase limita por defecto la respuesta del API a 1000 filas, y en algunos proyectos a 100). Por eso aparece "X de 100" / "X de 1000" y faltan equipos que sí se ven en la página pública de Rental.

La query actual no usa paginación:
```ts
supabase.from("equipment").select("...").order("name")
```
Eso aplica el límite por defecto del API y corta el resultado.

## Cambio
En `src/components/admin/EquipmentManager.tsx`, dentro de `fetchEquipment`:

- Reemplazar la query única por un loop que pagina con `.range(from, to)` en bloques de 1000 hasta que el bloque vuelva vacío o menor a 1000.
- Concatenar todos los lotes en un solo array y aplicar el mismo `transformed` que ya existe.
- Mantener el `.order("name")` y el mismo `select(...)` (incluyendo `categories(*)` y `subcategories(*)`).
- No cambiar nada del render, filtros, ni del contador "X de Y" — al traer todos los equipos, el contador pasa a reflejar el total real (1107+).

## Fuera de alcance
- No tocar la página pública `/equipos` ni `useEquipmentData` (esa ya filtra por `ownership_type` y es el comportamiento esperado del catálogo público).
- No agregar paginación visual en el admin; sigue siendo lista única con filtros.
