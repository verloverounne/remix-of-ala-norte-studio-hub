 import * as React from "react";
 import { cn } from "@/lib/utils";
 import { useScrollAnimation, useInteractiveHint, CinemaAnimation } from "@/hooks/useScrollAnimation";
 import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
 
 interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
   /** Tipo de animación cinematográfica */
   animation?: CinemaAnimation;
   /** Delay de la animación en segundos */
   delay?: number;
   /** Mostrar señal de interactividad */
   showInteractiveHint?: boolean;
   /** Tipo de señal interactiva */
   hintType?: "pulse" | "glow";
   /** Índice para stagger automático */
   staggerIndex?: number;
 }
 
 const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
   ({ 
     className, 
     animation = "cinema-focus", 
     delay = 0,
     showInteractiveHint = false,
     hintType = "pulse",
     staggerIndex,
     children,
     ...props 
   }, forwardedRef) => {
     const scrollAnimation = useScrollAnimation<HTMLDivElement>({
       animation,
       delay: staggerIndex !== undefined ? staggerIndex * 0.1 : delay,
     });
     
     const interactiveHint = useInteractiveHint<HTMLDivElement>(hintType);
 
     // Combinar refs
     const combinedRef = React.useCallback(
       (node: HTMLDivElement | null) => {
         // Asignar a scrollAnimation ref
         (scrollAnimation.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
         // Asignar a interactiveHint ref si está habilitado
         if (showInteractiveHint) {
           (interactiveHint.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
         }
         // Asignar al ref externo si existe
         if (typeof forwardedRef === "function") {
           forwardedRef(node);
         } else if (forwardedRef) {
           forwardedRef.current = node;
         }
       },
       [scrollAnimation.ref, interactiveHint.ref, showInteractiveHint, forwardedRef]
     );
 
     return (
       <Card
         ref={combinedRef}
         className={cn(
           scrollAnimation.className,
           showInteractiveHint && interactiveHint.className,
           className
         )}
         style={scrollAnimation.style}
         {...props}
       >
         {children}
       </Card>
     );
   }
 );
 AnimatedCard.displayName = "AnimatedCard";
 
 export { 
   AnimatedCard, 
   CardHeader, 
   CardFooter, 
   CardTitle, 
   CardDescription, 
   CardContent 
 };