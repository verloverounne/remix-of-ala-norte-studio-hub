
## Plan: Implementar Parallax Real Basado en Scroll para ServicesSection Mobile

### Problema Actual
- La animación `animate-slide-up-parallax` se ejecuta inmediatamente al cargar, no basada en scroll
- El contenido y video aparecen simultáneamente porque la animación CSS no está vinculada al scroll position
- El efecto parallax no está funcionando correctamente

### Solución: Scroll-Driven Parallax con Intersection Observer + Transform

#### 1. Crear Hook `useScrollParallax` para Mobile
Nuevo hook que calcula la posición del contenido basado en el scroll:
```typescript
// Calcula cuánto ha scrolleado el usuario dentro del contenedor de 200vh
// y aplica un transform translateY al contenido
const useScrollParallax = () => {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = rect.height; // 200vh
      const screenHeight = window.innerHeight;
      
      // Progreso: 0 cuando el contenedor entra, 1 cuando el primer vh termina
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / screenHeight));
      setProgress(progress);
    };
    // ... listeners
  }, []);
  
  return { containerRef, progress };
};
```

#### 2. Modificar la Estructura del ServiceSlide Mobile
**Actual (problemático):**
```jsx
<div className="lg:hidden h-[200vh] relative">
  {/* Video sticky - ✓ correcto */}
  <div className="sticky top-0 h-screen">...</div>
  
  {/* Contenido con animación CSS - ✗ no funciona con scroll */}
  <div className="sticky bottom-0 animate-slide-up-parallax">...</div>
</div>
```

**Nuevo (scroll-driven):**
```jsx
<div ref={containerRef} className="lg:hidden h-[200vh] relative">
  {/* Video sticky - permanece fijo */}
  <div className="sticky top-0 h-screen z-0">
    <video ... />
  </div>
  
  {/* Contenido con transform controlado por scroll */}
  <div 
    className="sticky bottom-0 z-10"
    style={{ 
      transform: `translateY(${(1 - progress) * 100}%)`,
      opacity: progress 
    }}
  >
    {/* El contenido empieza translateY(100%) cuando progress=0 */}
    {/* y llega a translateY(0%) cuando progress=1 */}
  </div>
</div>
```

#### 3. Comportamiento Esperado por Fases

| Scroll Position | Video | Contenido |
|-----------------|-------|-----------|
| Inicio (rect.top > 0) | Entra en pantalla | Oculto abajo (translateY: 100%) |
| Medio (rect.top = -100vh) | Sticky en pantalla | Sube gradualmente (translateY: 50%) |
| Final (rect.top = -200vh) | Comienza a salir | Visible completo (translateY: 0%) |
| Después | Sale de pantalla | Sale junto con video |

#### 4. Eliminar la Animación CSS Estática
Remover `animate-slide-up-parallax` del contenido móvil ya que ahora usamos transforms dinámicos basados en scroll.

#### 5. Ajuste del z-index
- Video: `z-0` para que quede detrás
- Contenido: `z-10` para que aparezca sobre el video

### Archivos a Modificar
1. `src/components/ServicesSection.tsx` - Implementar el parallax basado en scroll
2. `src/index.css` - (opcional) Limpiar la animación si ya no se usa en otros lugares

### Resultado Final
- Al scrollear hacia abajo, primero aparece el video llenando la pantalla
- El video permanece sticky mientras el contenido sube desde el borde inferior
- Al terminar el scroll de los 200vh, ambos elementos salen juntos de la pantalla
