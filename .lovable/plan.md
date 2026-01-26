

## Plan: Corregir Videos de Fondo en Slides de Servicios

### Problema Identificado

Los videos de fondo tienen clases CSS conflictivas que causan que no se muestren correctamente:

1. **`sticky` y `absolute` juntos** - Son incompatibles y causan comportamiento impredecible
2. **Falta `w-full`** en mobile - El video no ocupa el ancho completo
3. **`top-0` duplicado** en desktop

### Cambios a Realizar

**Archivo: `src/components/ServicesSection.tsx`**

#### 1. Corregir Video Desktop (línea 85)

```typescript
// ANTES (conflictos)
className="video-duotone sticky top-0 absolute left-0 top-0 w-full h-full object-cover border-0 bg-[#2e2c29]"

// DESPUÉS (correcto)
className="video-duotone absolute inset-0 w-full h-full object-cover border-0 bg-[#2e2c29]"
```

#### 2. Corregir Video Mobile (línea 129)

```typescript
// ANTES (conflictos y falta width)
className="sticky absolute top-0 video-duotone h-full object-cover"

// DESPUÉS (correcto - sticky para scroll behavior)
className="sticky top-0 w-full h-full video-duotone object-cover"
```

#### 3. Ajustar contenedor de media en mobile (línea 128)

```typescript
// ANTES
className=" h-screen z-0 duotone-hover-group"

// DESPUÉS (agregar sticky y position)
className="sticky top-0 h-screen z-0 duotone-hover-group overflow-hidden"
```

### Resultado Esperado

| Dispositivo | Antes | Después |
|-------------|-------|---------|
| **Mobile** | Video cortado o no visible | Video a alto completo (100vh), ancho completo |
| **Desktop** | Video con posición inestable | Video llena la columna izquierda (50% width, 100% height) |

### Comportamiento Final

- **Mobile**: Video sticky que ocupa toda la pantalla (100vw × 100vh), el contenido sube por encima con el scroll
- **Desktop**: Video en columna izquierda ocupando el 100% del ancho de la columna y 100% del alto

