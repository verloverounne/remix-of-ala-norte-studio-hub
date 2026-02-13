import { useEffect, useRef, useCallback } from "react";

interface UseParallaxOptions {
  speed?: number;
  offset?: number;
  direction?: "up" | "down";
  enabled?: boolean;
}

export const useParallax = (options: UseParallaxOptions = {}) => {
  const { speed = 1, offset = 0, direction = "up", enabled = true } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        const el = elementRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const wh = window.innerHeight;

        if (rect.bottom < 0 || rect.top > wh) return;

        const distanceFromCenter = (rect.top + rect.height / 2) - (wh / 2);
        const maxMovement = wh * 0.5;
        const parallaxValue = Math.max(-maxMovement, Math.min(maxMovement, distanceFromCenter * speed * 0.5));
        const finalValue = direction === "up" ? offset - parallaxValue : offset + parallaxValue;

        el.style.transform = `translate3d(0, ${finalValue}px, 0)`;
      });
    };

    setTimeout(handleScroll, 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [speed, offset, direction, enabled]);

  return {
    ref: elementRef,
    style: {
      willChange: "transform",
      backfaceVisibility: "hidden" as const,
      WebkitBackfaceVisibility: "hidden" as const,
    },
  };
};

export const useParallaxBackground = (speed: number = 1) => {
  return useParallax({ speed, direction: "up" });
};

export const useParallaxDown = (speed: number = 1) => {
  return useParallax({ speed, direction: "down" });
};
