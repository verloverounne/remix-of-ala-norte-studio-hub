import { useEffect, useRef, useState } from "react";

interface UseParallaxOptions {
  speed?: number; // Velocidad del parallax (0.1 = lento, 0.5 = medio, 1.0 = rápido)
  offset?: number; // Offset inicial
  direction?: "up" | "down"; // Dirección del movimiento
  enabled?: boolean; // Habilitar/deshabilitar parallax
}

/**
 * Hook personalizado para crear efectos parallax basados en el scroll
 * @param options - Opciones de configuración del parallax
 * @returns Ref y valor de transformación
 */
export const useParallax = (options: UseParallaxOptions = {}) => {
  const { speed = 0.5, offset = 0, direction = "up", enabled = true } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const [transform, setTransform] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!elementRef.current) {
            ticking = false;
            return;
          }

          const rect = elementRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Obtener la posición del elemento relativa al viewport
          const elementTop = rect.top;
          const elementHeight = rect.height;
          const elementBottom = elementTop + elementHeight;

          // Solo aplicar parallax cuando el elemento está visible en el viewport
          if (elementBottom < 0 || elementTop > windowHeight) {
            setTransform(0);
            ticking = false;
            return;
          }

          // Calcular cuando el elemento está en el viewport
          // El elemento se mueve más cuando está en el centro del viewport
          const elementCenter = elementTop + elementHeight / 2;
          const viewportCenter = windowHeight / 2;

          // Distancia desde el centro del viewport
          const distanceFromCenter = elementCenter - viewportCenter;

          // Calcular el desplazamiento parallax con límites
          // Multiplicamos por speed para controlar la intensidad
          // Limitamos el movimiento para que no se salga del viewport
          const maxMovement = windowHeight * 0.5; // Máximo 30% de la altura de la ventana
          const parallaxValue = Math.max(-maxMovement, Math.min(maxMovement, distanceFromCenter * speed * 0.5));

          const finalValue = direction === "up" ? offset - parallaxValue : offset + parallaxValue;

          setTransform(finalValue);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Ejecutar al cargar
    setTimeout(() => handleScroll(), 100);

    // Agregar listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [speed, offset, direction, enabled]);

  return {
    ref: elementRef,
    style: {
      transform: `translateY(${transform}px)`,
      willChange: "transform",
    },
  };
};

/**
 * Hook simplificado para parallax en elementos de fondo
 */
export const useParallaxBackground = (speed: number = 0.3) => {
  return useParallax({ speed, direction: "up" });
};

/**
 * Hook para parallax en elementos que se mueven hacia abajo
 */
export const useParallaxDown = (speed: number = 0.3) => {
  return useParallax({ speed, direction: "down" });
};
