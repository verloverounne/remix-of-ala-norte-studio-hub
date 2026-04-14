

## Plan: Eliminar columnas vacías de la tabla `equipment`

### Cambio
Una migración SQL que elimina las 9 columnas donde todas las filas tienen NULL:

```sql
ALTER TABLE public.equipment
  DROP COLUMN descripcion_corta_es,
  DROP COLUMN descripcion_corta_en,
  DROP COLUMN detailed_description,
  DROP COLUMN featured_copy,
  DROP COLUMN observaciones_internas,
  DROP COLUMN price_per_week,
  DROP COLUMN sku_rentalos,
  DROP COLUMN tamano,
  DROP COLUMN tipo_equipo;
```

### Código a actualizar
- `src/types/supabase.ts` — remover las 9 propiedades del interface `Equipment`
- `src/types/equipment.ts` (si referencia alguna de estas columnas)
- `src/components/admin/EquipmentManager.tsx` — verificar que no use estas columnas
- `src/pages/Admin.tsx` — verificar referencias en formularios/exports
- `src/integrations/supabase/types.ts` se regenera automáticamente

### Impacto
Solo se eliminan columnas sin datos. No afecta funcionalidad existente.

