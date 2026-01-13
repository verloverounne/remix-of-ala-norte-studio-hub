# Guía: Dónde Modificar/Eliminar Bordes en Secciones de Rental

## 📍 Color de Borde Principal (CSS Global)

**Archivo:** `src/index.css`  
**Línea:** 46

```css
--border: 43 7% 81%; /* #d2d0cb Color de todos los bordes en modo claro */
```

**Para cambiar el color:** Modifica esta línea con el nuevo valor HSL.

**Para eliminar todos los bordes:** Cambia a `transparent` o `0 0% 0% / 0%`

---

## 🔧 Componentes de Rental con Bordes

### 1. CategorySection.tsx
**Archivo:** `src/components/rental/CategorySection.tsx`

#### Línea 109 - Header de categoría sticky:
```tsx
className="sticky z-20 bg-background border border-foreground mb-0"
```
**Para eliminar:** Quita `border border-foreground` o cámbialo a `border-0`

#### Línea 133 - Select trigger:
```tsx
className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm font-heading border border-foreground"
```
**Para eliminar:** Quita `border border-foreground` o cámbialo a `border-0`

#### Línea 136 - Select content:
```tsx
className="bg-background border border-foreground z-50"
```
**Para eliminar:** Quita `border border-foreground` o cámbialo a `border-0`

#### Línea 157 - Grid de equipos:
```tsx
className="border-x border-b border-foreground p-3 sm:p-4 bg-background"
```
**Para eliminar:** Quita `border-x border-b border-foreground` o cámbialo a `border-0`

#### Línea 189 - Placeholder de imagen:
```tsx
placeholderClassName="border-b-2 border-foreground"
```
**Para eliminar:** Quita `border-b-2 border-foreground`

#### Línea 192 - Contenedor de imagen:
```tsx
className="w-full h-full flex items-center justify-center bg-muted border-b-2 border-foreground"
```
**Para eliminar:** Quita `border-b-2 border-foreground`

---

### 2. HeroCarouselRental.tsx
**Archivo:** `src/components/rental/HeroCarouselRental.tsx`

#### Línea 203 - Loading state:
```tsx
className="h-[50vh] bg-muted animate-pulse flex items-center justify-center border-b border-foreground"
```
**Para eliminar:** Quita `border-b border-foreground`

#### Línea 215 - Barra de navegación fija:
```tsx
className="fixed left-0 right-0 z-40 bg-background border-b border-foreground transition-all duration-300"
```
**Para eliminar:** Quita `border-b border-foreground`

#### Línea 235 - Botones de categoría (inactivos):
```tsx
: "bg-background text-foreground border-foreground hover:bg-muted"
```
**Para eliminar:** Quita `border-foreground` o cámbialo a `border-0`

#### Línea 262 - Botón de cantidad:
```tsx
className="border-2 border-foreground h-7 w-7 sm:h-9 sm:w-9 p-0 flex-shrink-0"
```
**Para eliminar:** Quita `border-2 border-foreground` o cámbialo a `border-0`

#### Línea 278 - Input de cantidad:
```tsx
className="border-2 border-foreground h-7 sm:h-9 px-2 flex-shrink-0"
```
**Para eliminar:** Quita `border-2 border-foreground` o cámbialo a `border-0`

#### Línea 310 - Input de búsqueda:
```tsx
className="pl-7 sm:pl-10 border-2 border-foreground font-heading uppercase text-xs sm:text-sm h-8 sm:h-10"
```
**Para eliminar:** Quita `border-2 border-foreground` o cámbialo a `border-0`

---

### 3. QuoteSidebar.tsx
**Archivo:** `src/components/rental/QuoteSidebar.tsx`

#### Línea 19 - Contenedor principal:
```tsx
className="lg:sticky lg:top-40 border border-foreground p-4 sm:p-6 bg-card shadow-brutal max-h-[calc(100vh-12rem)] overflow-y-auto"
```
**Para eliminar:** Quita `border border-foreground` o cámbialo a `border-0`

#### Línea 20 - Título:
```tsx
className="font-heading text-lg sm:text-xl mb-4 uppercase border-b border-foreground pb-2"
```
**Para eliminar:** Quita `border-b border-foreground`

#### Línea 32 - Items de cotización:
```tsx
className="text-sm border-b border-foreground/20 pb-2 w-full"
```
**Para eliminar:** Quita `border-b border-foreground/20`

#### Línea 41 - Total:
```tsx
className="border-t border-foreground pt-4 mt-4"
```
**Para eliminar:** Quita `border-t border-foreground`

---

### 4. CartSidebar.tsx
**Archivo:** `src/components/rental/CartSidebar.tsx`

#### Línea 30 - Header del carrito:
```tsx
className="p-4 border-b-2 border-foreground"
```
**Para eliminar:** Quita `border-b-2 border-foreground`

#### Línea 49 - Items del carrito:
```tsx
className="border-2 border-foreground/20 p-3 bg-card"
```
**Para eliminar:** Quita `border-2 border-foreground/20` o cámbialo a `border-0`

#### Línea 53 - Imagen del item:
```tsx
className="w-16 h-16 flex-shrink-0 border border-foreground/20 overflow-hidden"
```
**Para eliminar:** Quita `border border-foreground/20`

#### Línea 67 - Controles de cantidad:
```tsx
className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10"
```
**Para eliminar:** Quita `border-t border-foreground/10`

#### Línea 71 y 79 - Botones de cantidad:
```tsx
className="w-7 h-7 border-2 border-foreground flex items-center justify-center..."
```
**Para eliminar:** Quita `border-2 border-foreground` o cámbialo a `border-0`

#### Línea 106 - Footer del carrito:
```tsx
className="p-4 border-t border-foreground bg-muted/30"
```
**Para eliminar:** Quita `border-t border-foreground`

#### Línea 134 - Badge de cantidad:
```tsx
className="relative bg-primary text-primary-foreground p-4 rounded-full shadow-brutal-sm border border-foreground..."
```
**Para eliminar:** Quita `border border-foreground`

#### Línea 138 - Badge de notificación:
```tsx
className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-foreground"
```
**Para eliminar:** Quita `border border-foreground`

#### Línea 148 - Drawer header:
```tsx
className="border-b border-foreground"
```
**Para eliminar:** Quita `border-b border-foreground`

#### Línea 170 - Drawer content:
```tsx
className="sticky z-20 border border-foreground bg-card shadow-brutal"
```
**Para eliminar:** Quita `border border-foreground` o cámbialo a `border-0`

---

## 🎯 Opciones para Modificar/Eliminar Bordes

### Opción 1: Cambiar a `border-border` (usa el color #d2d0cb)
Reemplaza `border-foreground` por `border-border` en las clases.

### Opción 2: Eliminar completamente
Reemplaza `border border-foreground` por `border-0` o simplemente quita la clase `border`.

### Opción 3: Hacer transparente
Cambia `border-foreground` por `border-transparent`.

---

## 📝 Resumen de Archivos a Modificar

1. **src/index.css** (línea 46) - Color global de bordes
2. **src/components/rental/CategorySection.tsx** - 6 lugares con bordes
3. **src/components/rental/HeroCarouselRental.tsx** - 7 lugares con bordes
4. **src/components/rental/QuoteSidebar.tsx** - 4 lugares con bordes
5. **src/components/rental/CartSidebar.tsx** - 9 lugares con bordes

**Total:** ~26 lugares donde se usan bordes en los componentes de rental.
