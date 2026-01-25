import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollParallaxOptions {
  enabled?: boolean;
  /** Factor de velocidad: >1 = más lento, <1 = más rápido. Default: 1.5 */
  speedFactor?: number;
}

/**
 * Hook para calcular el progreso de scroll dentro de un contenedor
 * para crear efectos parallax basados en scroll.
 * Optimizado con requestAnimationFrame y throttling.
 */
export const useScrollParallax = (options: UseScrollParallaxOptions = {}) => {
  const { enabled = true, speedFactor = 1.5 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);
  const lastProgress = useRef(0);

  const updateProgress = useCallback(() => {
    if (!containerRef.current || !enabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    
    // scrolled = cuánto ha entrado el contenedor en la pantalla
    const scrolled = screenHeight - rect.top;
    
    // Usamos speedFactor para hacer la aparición más lenta
    // speedFactor > 1 significa que necesitamos más scroll para llegar a progress=1
    const scrollRange = screenHeight * speedFactor;
    const rawProgress = scrolled / scrollRange;
    
    // Aplicamos easing para una aparición más suave (ease-out)
    const easedProgress = Math.max(0, Math.min(1, rawProgress));
    
    // Solo actualizar si el cambio es significativo (>0.5% de diferencia)
    // Esto evita re-renders innecesarios
    if (Math.abs(easedProgress - lastProgress.current) > 0.005) {
      lastProgress.current = easedProgress;
      setProgress(easedProgress);
    }
  }, [enabled, speedFactor]);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      // Throttle con RAF: solo un cálculo por frame
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking.current = false;
        });
      }
    };

    // Ejecutar al cargar
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [enabled, updateProgress]);

  // Calcular estilos de contenido basados en progress
  // El contenido empieza en translateY(100%) (oculto abajo) y llega a translateY(0%) (visible)
  const contentStyle = {
    transform: `translateY(${(1 - progress) * 100}%)`,
    opacity: progress,
    transition: 'none',
    willChange: 'transform, opacity',
  };

  return {
    containerRef,
    progress,
    contentStyle,
  };
};

export default useScrollParallax;
