 import { useEffect, useRef, useState, useCallback } from "react";
 
 export type CinemaAnimation = 
   | "cinema-focus" 
   | "digital-glitch" 
   | "battery-load" 
   | "reveal-scan" 
   | "aperture-open";
 
 interface UseScrollAnimationOptions {
   /** Tipo de animación cinematográfica */
   animation?: CinemaAnimation;
   /** Umbral de visibilidad (0-1) */
   threshold?: number;
   /** Delay en segundos */
   delay?: number;
   /** Solo animar una vez */
   once?: boolean;
   /** Margen del root */
   rootMargin?: string;
 }
 
 /**
  * Hook para aplicar animaciones cinematográficas al hacer scroll
  * Detecta cuando un elemento entra en el viewport y aplica la animación
  */
 export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
   options: UseScrollAnimationOptions = {}
 ) => {
   const {
     animation = "cinema-focus",
     threshold = 0.1,
     delay = 0,
     once = true,
     rootMargin = "0px 0px -50px 0px",
   } = options;
 
   const elementRef = useRef<T>(null);
   const [isInView, setIsInView] = useState(false);
   const [hasAnimated, setHasAnimated] = useState(false);
 
   useEffect(() => {
     const element = elementRef.current;
     if (!element) return;
 
     // Si ya animó y es once, no hacer nada
     if (once && hasAnimated) return;
 
     const observer = new IntersectionObserver(
       ([entry]) => {
         if (entry.isIntersecting) {
           setIsInView(true);
           if (once) {
             setHasAnimated(true);
             observer.disconnect();
           }
         } else if (!once) {
           setIsInView(false);
         }
       },
       { threshold, rootMargin }
     );
 
     observer.observe(element);
 
     return () => observer.disconnect();
   }, [threshold, rootMargin, once, hasAnimated]);
 
   const animationClass = isInView ? `animate-${animation}` : "";
   const delayStyle = delay > 0 ? { animationDelay: `${delay}s` } : {};
 
   return {
     ref: elementRef,
     isInView,
     className: `scroll-animate ${isInView ? "in-view" : ""} ${animationClass}`,
     style: delayStyle,
   };
 };
 
 /**
  * Hook para señal de interactividad (solo una vez)
  * Aplica un pulso o brillo para indicar que el elemento es interactivo
  */
 export const useInteractiveHint = <T extends HTMLElement = HTMLDivElement>(
   type: "pulse" | "glow" = "pulse"
 ) => {
   const elementRef = useRef<T>(null);
   const [hasShown, setHasShown] = useState(false);
 
   useEffect(() => {
     const element = elementRef.current;
     if (!element || hasShown) return;
 
     const observer = new IntersectionObserver(
       ([entry]) => {
         if (entry.isIntersecting && !hasShown) {
           setHasShown(true);
           observer.disconnect();
         }
       },
       { threshold: 0.5 }
     );
 
     observer.observe(element);
 
     return () => observer.disconnect();
   }, [hasShown]);
 
   const animationClass = type === "pulse" 
     ? "animate-interactive-hint" 
     : "animate-interactive-glow";
 
   return {
     ref: elementRef,
     className: hasShown ? animationClass : "",
   };
 };
 
 /**
  * Hook para aplicar animaciones stagger a una lista de elementos
  */
 export const useStaggerAnimation = (
   itemCount: number,
   animation: CinemaAnimation = "cinema-focus",
   baseDelay: number = 0.1
 ) => {
   const getItemProps = useCallback(
     (index: number) => ({
       className: `scroll-animate animate-${animation}`,
       style: { animationDelay: `${index * baseDelay}s` },
     }),
     [animation, baseDelay]
   );
 
   return { getItemProps };
 };
 
 export default useScrollAnimation;