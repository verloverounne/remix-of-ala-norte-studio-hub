

## Plan: Corregir Sincronización de Tabs de Servicios

### Problema Identificado

Hay errores de sintaxis en las clases CSS que causan que los tabs no se muestren/sincronicen correctamente:

1. **Línea 268**: `"hi sm:flex"` - la clase `"hi"` es un error tipográfico
2. **Línea 269**: `bg-[#8c857 d]` - hay un espacio incorrecto en el color hex

### Cambios a Realizar

**Archivo: `src/components/ServicesSection.tsx`**

#### Corrección 1 - Línea 268
```typescript
// ANTES (error)
<div className={cn("hi sm:flex items-center justify-between gap-0", dropdownOpen && "hidden")}>

// DESPUÉS (correcto)
<div className={cn("hidden sm:flex items-center justify-between gap-0", dropdownOpen && "hidden")}>
```

#### Corrección 2 - Línea 269
```typescript
// ANTES (error - espacio en el color)
className={cn("flex-1 font-heading text-xs transition-all rounded-none shadow-none px-0 py-[16px] my-[16px] bg-[#8c857 d]", ...)}

// DESPUÉS (correcto)
className={cn("flex-1 font-heading text-xs transition-all rounded-none shadow-none px-0 py-[16px] my-[16px]", ...)}
```
(Remover el color inválido ya que el estado activo/inactivo ya define los colores correctos)

### Resultado Esperado

| Dispositivo | Antes | Después |
|------------|-------|---------|
| Mobile | Dropdown visible, tabs ocultos | Sin cambios (correcto) |
| Desktop | Tabs posiblemente mal renderizados | Tabs visibles y sincronizados con el carrusel |

Los tabs de desktop ahora:
- Se mostrarán correctamente con `hidden sm:flex`
- Estarán sincronizados con el índice del carrusel
- El tab activo tendrá el estilo correcto (`bg-primary text-primary-foreground`)
- Los tabs inactivos tendrán el estilo de fondo (`bg-background text-foreground`)

