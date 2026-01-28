
# Plan: Preloader con Logo Animado y Círculo de Progreso

## Resumen

Crear un preloader para la página Home que muestre el logo de Ala Norte con una animación de brújula (rotación aleatoria entre -15° y +15° en el eje Y) y un círculo de progreso rojo que se completa mientras cargan los videos del hero.

## Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  ┌───────────────────────────────────────────┐  │
│  │           HomePreloader                    │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Logo (navBarLogo.png)              │  │  │
│  │  │  - Animación rotateY(-15° a +15°)   │  │  │
│  │  │  - Transición suave tipo brújula    │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  SVG Circle Progress (rojo)         │  │  │
│  │  │  - stroke-dasharray animado         │  │  │
│  │  │  - Circunda el logo                 │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │        Home (visible cuando ready)         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Archivos a Crear/Modificar

### 1. Crear componente HomePreloader
**Archivo:** `src/components/HomePreloader.tsx`

- Recibe `progress` (0-100) y `onComplete` como props
- Logo centrado usando `navBarLogo.png`
- Animación de brújula con `useEffect` + `setInterval`:
  - Genera ángulo aleatorio entre -15° y +15°
  - Aplica `transform: rotateY(${angle}deg)` con transición suave
  - Intervalo de 800-1200ms para efecto mecánico
- Círculo SVG de progreso:
  - Radio apropiado para circundar el logo
  - `stroke` color primario (rojo)
  - `stroke-dasharray` y `stroke-dashoffset` calculados según `progress`
  - Animación fluida con CSS transition
- Fade-out cuando progress = 100

### 2. Modificar Home.tsx
**Archivo:** `src/pages/Home.tsx`

- Agregar estado `videosLoaded` y `loadingProgress`
- Implementar lógica de precarga de videos del hero:
  - Obtener URLs de videos desde `useGalleryImages`
  - Crear elementos `<video>` ocultos para precargar
  - Trackear progreso con eventos `loadeddata` o `canplaythrough`
  - Calcular porcentaje de completado
- Mostrar `HomePreloader` mientras `!videosLoaded`
- Renderizar contenido de Home cuando `videosLoaded = true`

### 3. Agregar animaciones a Tailwind
**Archivo:** `tailwind.config.ts`

- Agregar keyframe `compass-wobble` para la animación de brújula
- Agregar keyframe `progress-spin` para efecto de carga inicial

### 4. Agregar estilos CSS
**Archivo:** `src/index.css`

- Estilos para el círculo SVG de progreso
- Clase para animación de fade-out del preloader

## Detalles Técnicos

### Animación de Brújula (Logo)
```text
- Rotación en eje Y (perspectiva 3D)
- Ángulo aleatorio: Math.random() * 30 - 15 (rango -15° a +15°)
- Transición: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)
- Intervalo: 800-1200ms (aleatorizado para naturalidad)
```

### Círculo de Progreso SVG
```text
- Círculo SVG con stroke-dasharray
- Circunferencia: 2 * π * radio
- stroke-dashoffset: circunferencia * (1 - progress/100)
- Color: hsl(348 83% 47%) (--primary)
- Stroke-width: 4px
- Transición suave del dashoffset
```

### Lógica de Precarga de Videos
```text
1. Obtener gallery_images con page_type = "home_hero"
2. Filtrar solo media_type = "video"
3. Para cada video URL, crear elemento <video> oculto
4. Escuchar evento "canplaythrough" 
5. Incrementar contador de videos cargados
6. progress = (videosLoaded / totalVideos) * 100
7. Cuando todos carguen, esperar 500ms y hacer fade-out
```

## Flujo de Usuario

1. Usuario accede a la Home
2. Se muestra preloader con logo oscilando como brújula
3. Círculo rojo se va completando según cargan los videos
4. Al completar la carga, preloader hace fade-out suave
5. Se muestra el contenido de Home con videos listos para reproducir

## Consideraciones

- Si no hay videos (error o vacío), mostrar preloader por 1.5s mínimo y continuar
- Timeout máximo de 8 segundos para evitar bloqueo indefinido
- El preloader solo se muestra en la Home, no en otras páginas
- Mantener la animación de brújula constante hasta que se complete la carga
