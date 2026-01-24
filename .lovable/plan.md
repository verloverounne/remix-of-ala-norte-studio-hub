
## Plan: Corregir Sección de Servicios - Mobile y Desktop

### Problema 1: Hover/Tap no quita el filtro duotone en mobile

**Causa raíz:** Los elementos superpuestos (overlay + contenido con blur) interceptan los toques antes de que lleguen al video.

**Solución:**
1. Agregar `pointer-events: none` al overlay oscuro y al contenedor de contenido en mobile
2. Usar `pointer-events: auto` solo en los elementos interactivos (botones, links)
3. Mover el `duotone-hover-group` para que cubra toda el área táctil, no solo el media

```tsx
{/* Overlay oscuro - no intercepta toques */}
<div className="absolute inset-0 bg-foreground/40 pointer-events-none" />

{/* Contenido - no intercepta toques excepto botones */}
<div className="absolute inset-0 ... pointer-events-none">
  <div className="...">
    {/* Buttons need pointer-events-auto */}
    <Button className="pointer-events-auto" ...>
```

### Problema 2: Play/Pause no funciona on touch

**Causa raíz:** Mismo que arriba - los toques no llegan al video.

**Solución adicional:**
1. Modificar el contenedor mobile para que el tap en cualquier parte (excepto CTA) active el video
2. Agregar un handler manual `onClick` en el contenedor principal que:
   - Detecte si es touch device
   - Toggle play/pause del video
   - Toggle la clase `duotone-tap-active`

```tsx
const handleMobileTap = (e: React.MouseEvent) => {
  const target = e.target as Element;
  // Si es un botón/link, no hacer nada
  if (target.closest('a, button')) return;
  
  // Toggle video play/pause
  if (videoRef.current) {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }
};
```

### Problema 3: Contenido derecho no visible completo (desktop + mobile)

**Desktop:**
1. Cambiar `justify-start` a `justify-center` en la columna derecha
2. Reducir la velocidad del parallax del texto o eliminarlo
3. Agregar `overflow-y-auto` si el contenido es muy largo

**Mobile:**
1. El CTA usa `button_text`/`button_link` pero debería usar también `cta_label`/`cta_url` como fallback
2. Reducir padding y márgenes para que quepa todo
3. Posicionar el contenido más arriba (cambiar `items-center justify-center` a `items-end pb-[100px]`)

```tsx
{/* Desktop - columna derecha */}
<div className="flex-col h-full p-8 lg:p-12 xl:p-16 overflow-hidden 
                flex items-start justify-center bg-background">
  {/* Remover parallax del texto o hacerlo más sutil */}
  <div className="max-w-xl text-foreground space-y-4">
    ...
  </div>
</div>

{/* Mobile - posicionar contenido visible */}
<div className="absolute inset-0 p-6 flex items-end justify-center pb-[100px] pointer-events-none">
  <div className="backdrop-blur-md p-4 w-full bg-background/30 ...">
    ...
    {/* Usar cta_label/cta_url como fallback */}
    {(service.button_text || service.cta_label) && 
     (service.button_link || service.cta_url) && (
      <Button asChild className="pointer-events-auto">
        <Link to={service.button_link || service.cta_url!}>
          {service.button_text || service.cta_label}
        </Link>
      </Button>
    )}
  </div>
</div>
```

### Resumen de cambios en `ServicesSection.tsx`:

1. **Línea 60-70 (desktop):** Ajustar `justify-center` y reducir/eliminar parallax del texto
2. **Línea 104 (mobile):** Agregar `onClick` handler para toggle video
3. **Línea 113 (overlay):** Agregar `pointer-events-none`
4. **Línea 116 (contenido):** Agregar `pointer-events-none` y cambiar posición a `items-end pb-[100px]`
5. **Línea 125-130 (CTA mobile):** Usar fallback `cta_label`/`cta_url` y agregar `pointer-events-auto`
6. **Reducir espaciado** en mobile para que todo el contenido sea visible
