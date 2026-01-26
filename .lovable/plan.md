

## Plan: Acelerar el Parallax para Mostrar Contenido sobre 80% del Video

### Diagnóstico
El `speedFactor` actual es **3**, lo que significa que el usuario debe scrollear 3 veces la altura de la pantalla para que el contenido aparezca completamente. Esto es demasiado lento.

### Solución
Reducir el `speedFactor` a **0.8** para que el contenido complete su animación después de scrollear solo el 80% de la altura de la pantalla.

### Cambios a realizar

**Archivo: `src/hooks/useScrollParallax.tsx`**

Cambiar línea 15:
```typescript
// ANTES
const { enabled = true, speedFactor = 3 } = options;

// DESPUÉS  
const { enabled = true, speedFactor = 0.8 } = options;
```

### Comportamiento resultante

| speedFactor | Scroll necesario para 100% contenido |
|-------------|--------------------------------------|
| 3 (actual)  | 300% de la pantalla                 |
| 1.0         | 100% de la pantalla                 |
| **0.8**     | **80% de la pantalla** ✓            |

### Resultado esperado
- El contenido empezará a aparecer inmediatamente cuando el usuario comience a scrollear
- Al scrollear el 80% de la altura de la pantalla, el contenido estará completamente visible sobre el video
- La experiencia será más rápida y el usuario verá el contenido superpuesto mucho antes

