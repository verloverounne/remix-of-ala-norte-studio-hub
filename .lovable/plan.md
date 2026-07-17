## Mejoras al PDF de lista de equipos

Editar `src/lib/exportEquipmentPdf.ts` con los siguientes cambios visuales y de contenido:

### Contenido
- **Filtrar equipos**: excluir del PDF los items con `status !== "available"` (no listar los "no disponibles" / mantenimiento).
- **Eliminar columna Cantidad**: la tabla queda con 2 columnas: Nombre y Precio.

### Layout de categorías
- Cada categoría **inicia en página nueva** (salto de página antes del título, excepto la primera).
- Título de categoría renderizado como una **barra completa de ancho de página**:
  - Fondo: rojo (equivalente Tailwind `red-600` → RGB `220, 38, 38`).
  - Texto: blanco, bold, mayúsculas.
  - Padding vertical generoso, sin línea subrayada (se elimina la línea actual).

### Subcategorías
- Título de subcategoría renderizado como **barra de ancho completo**:
  - Fondo: gris claro (equivalente `gray-200` → RGB `229, 231, 235`).
  - Texto: rojo oscuro (equivalente `red-800` → RGB `153, 27, 27`), bold, mayúsculas.
- **Espacio superior de 8pt** antes de cada bloque de subcategoría (spacer previo al header).

### Detalles técnicos
- Ajustar `ensureSpace` para que el salto por categoría siempre agregue `doc.addPage()` (excepto en el primer grupo).
- Recalcular anchos de columna de `autoTable` al quitar la columna de cantidad (Nombre auto, Precio 90pt derecha).
- Mantener header, footer, logo y orden alfabético existentes.

No se tocan otros archivos.
