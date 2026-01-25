import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollParallaxOptions {
  enabled?: boolean;
}

/**
 * Hook para calcular el progreso de scroll dentro de un contenedor
 * para crear efectos parallax basados en scroll
 */
export const useScrollParallax = (options: UseScrollParallaxOptions = {}) => {
  const { enabled = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  const updateProgress = useCallback(() => {
    if (!containerRef.current || !enabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    
    // scrolled = cuánto ha entrado el contenedor en la pantalla
    // Cuando rect.top = screenHeight, el contenedor está justo debajo del viewport (scrolled = 0)
    // Cuando rect.top = 0, el contenedor está en el top del viewport (scrolled = screenHeight)
    // Cuando rect.top = -screenHeight, hemos scrolleado una pantalla dentro del contenedor
    const scrolled = screenHeight - rect.top;
    
    // Normalizamos para que progress vaya de 0 a 1 durante el primer 100vh de scroll
    // Progress = 0: contenedor recién entra
    // Progress = 1: hemos scrolleado 100vh dentro del contenedor
    const normalizedProgress = Math.max(0, Math.min(1, scrolled / screenHeight));
    
    setProgress(normalizedProgress);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking.current = false;
        });
        ticking.current = true;
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
