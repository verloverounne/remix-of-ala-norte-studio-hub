

## Plan: Convertir los Tabs de Servicios en un Slider Sincronizado con Snap-to-Center

### Objetivo
Transformar los botones de servicios móviles en un slider horizontal donde:
1. El usuario puede deslizar los tabs horizontalmente
2. Los tabs hacen "snap" al centro de la pantalla
3. El tab que queda centrado activa automáticamente el slide correspondiente

### Cambios Técnicos en `src/components/ServicesSection.tsx`

#### 1. Crear un segundo Embla Carousel para los tabs móviles
- Usar `useEmblaCarousel` con opciones de centrado:
  ```typescript
  const [tabsRef, tabsApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: false,
    dragFree: false
  });
  ```

#### 2. Sincronizar ambos carruseles bidirecionalmente
- Cuando el usuario desliza los tabs y uno queda centrado, activar el slide principal:
  ```typescript
  useEffect(() => {
    if (!tabsApi) return;
    const onTabSelect = () => {
      const selectedTab = tabsApi.selectedScrollSnap();
      setActiveIndex(selectedTab);
      emblaApi?.scrollTo(selectedTab);
    };
    tabsApi.on("select", onTabSelect);
    return () => tabsApi.off("select", onTabSelect);
  }, [tabsApi, emblaApi]);
  ```

- Cuando cambia el slide principal (por flechas o swipe), mover los tabs:
  ```typescript
  useEffect(() => {
    if (!emblaApi || !tabsApi) return;
    tabsApi.scrollTo(activeIndex);
  }, [activeIndex, tabsApi]);
  ```

#### 3. Estilos para el slider de tabs móviles
- Cada tab como slide individual con ancho fijo:
  ```jsx
  <div className="flex-[0_0_auto] min-w-[120px] px-2">
    <button className="w-full whitespace-nowrap ...">
      {service.title}
    </button>
  </div>
  ```
- CSS scroll-snap para centrado suave:
  ```css
  scroll-snap-type: x mandatory;
  scroll-snap-align: center;
  ```

#### 4. Indicador visual del tab activo/centrado
- El tab centrado tendrá estilos destacados (bg-primary)
- Los tabs laterales tendrán estilos secundarios para indicar que se puede seguir deslizando

### Resultado Esperado
- En mobile, el usuario desliza los tabs como un carrusel
- El tab que queda centrado activa automáticamente su slide
- Tocar un tab también funciona para activar su slide
- Las flechas del carrusel principal también mueven los tabs
- Experiencia fluida y sincronizada entre navegación y contenido

