
# Plan: Conmutador de Disponibilidad para Equipos

## Objetivo
Agregar un conmutador (switch) de disponibilidad en:
1. El modal de edición de equipos del admin
2. El listado de equipos en la pestaña de equipos del admin
3. Filtrar equipos no disponibles en la página de rental `/rental`

---

## Cambios Requeridos

### 1. `src/components/admin/EquipmentManager.tsx`

**Modificaciones al interface `Equipment`:**
- Agregar campo `status` al interface local

**Modificaciones a `fetchEquipment`:**
- Incluir `status` en el select de la consulta

**Modificaciones a `handleEditEquipment`:**
- Incluir `status` en los datos del equipo que se cargan

**Modificaciones a `handleUpdateEquipment`:**
- Incluir `status` en el update

**Modificaciones al listado de equipos:**
- Mostrar badge visual de disponibilidad (verde: disponible, rojo: no disponible)
- Agregar switch inline para cambio rápido de disponibilidad

**Modificaciones al modal de edición:**
- Agregar switch "Disponible" con label que indique el estado actual

---

### 2. `src/pages/Equipos.tsx`

**Modificaciones a `filteredEquipment`:**
- Agregar filtro para excluir equipos con `status !== 'available'`

---

## Detalles de Implementación

### Interface Equipment actualizado
```typescript
interface Equipment {
  // ... campos existentes
  status: 'available' | 'rented' | 'maintenance';
}
```

### Nuevo Switch en el Modal de Edición (líneas ~1160-1176)
```tsx
<div className="flex items-center gap-2">
  <Switch
    checked={editingEquipment.status === 'available'}
    onCheckedChange={(v) => setEditingEquipment({ 
      ...editingEquipment, 
      status: v ? 'available' : 'maintenance' 
    })}
  />
  <Label>Disponible para alquiler</Label>
</div>
```

### Badge de estado en el listado (dentro del grid de badges ~871-884)
```tsx
{eq.status === 'available' ? (
  <Badge variant="default" className="text-xs bg-green-600">
    Disponible
  </Badge>
) : (
  <Badge variant="destructive" className="text-xs">
    No disponible
  </Badge>
)}
```

### Filtro en Equipos.tsx (dentro de filteredEquipment ~115-126)
```typescript
const filteredEquipment = useMemo(() => {
  return equipment.filter((item) => {
    // Solo mostrar equipos disponibles
    if (item.status !== 'available') return false;
    
    const matchesSearch = /* ... */;
    const matchesSubcategory = /* ... */;
    return matchesSearch && matchesSubcategory;
  });
}, [equipment, searchTerm, selectedSubcategories]);
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/EquipmentManager.tsx` | Agregar status al interface, consultas, modal de edición, y badges en listado |
| `src/pages/Equipos.tsx` | Filtrar equipos no disponibles |

---

## Comportamiento Esperado

| Escenario | Resultado |
|-----------|-----------|
| Equipo con status `available` | Visible en rental y admin |
| Equipo con status `rented` o `maintenance` | Solo visible en admin, oculto en rental |
| Switch activado en admin | Status cambia a `available` |
| Switch desactivado en admin | Status cambia a `maintenance` |
