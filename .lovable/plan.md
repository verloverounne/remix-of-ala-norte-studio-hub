
# Plan: Reducir consultas a la nube al minimo

## Situacion actual

Cada vez que un usuario visita el sitio, se hacen multiples consultas a la base de datos. Muchos de estos datos cambian muy raramente (solo cuando el admin los edita). El sistema ya tiene un cache de 24hs en localStorage pero igual hace la primera consulta siempre en sesiones nuevas.

## Consultas actuales identificadas

| Consulta | Donde se usa | Frecuencia de cambio | Accion propuesta |
|---|---|---|---|
| `gallery_images` (todas) | Home hero, Cartoni, Contacto, Galeria, Sala, Producciones, Institutional, Rental hero, Video preloader | Muy rara (admin) | **Hardcodear como JSON estatico** |
| `equipment` (featured=true) | Home page | Rara | **Hardcodear como JSON estatico** |
| `home_services` (is_active=true) | Home ServicesSection, Servicios page | Rara | **Hardcodear como JSON estatico** |
| `equipment` + `categories` + `subcategories` | Equipos page (catalogo) | Media (precios, stock) | **Mantener con cache existente** (datos operativos) |
| `equipment` + `spaces` (SearchBar) | Header (busqueda) | Media | **Mantener con cache existente** |
| `blog_articles` + `blog_categories` | Blog | Media | **Mantener** (contenido editorial) |

## Cambios propuestos

### 1. Crear archivo de datos estaticos para gallery_images
**Archivo nuevo:** `src/data/galleryData.ts`

Exportar todas las gallery_images como un array constante, copiando los datos exactos que devuelve la API actualmente (ya los tenemos del network request). Incluir una funcion helper `getByPageType()`.

### 2. Crear archivo de datos estaticos para home_services
**Archivo nuevo:** `src/data/servicesData.ts`

Exportar los 6 servicios activos como constante, tomados del response actual de la API.

### 3. Crear archivo de datos estaticos para featured equipment
**Archivo nuevo:** `src/data/featuredEquipment.ts`

Exportar los 2 equipos destacados actuales como constante.

### 4. Modificar `useGalleryImages` hook
Cambiar para que use los datos estaticos en lugar de consultar la base de datos. Eliminar la logica de fetch y cache. El hook seguira exponiendo la misma interfaz (`images`, `loading: false`, `getByPageType`).

### 5. Modificar Home.tsx
Eliminar la consulta `supabase.from("equipment").eq("featured", true)` y usar los datos importados directamente.

### 6. Modificar ServicesSection.tsx
Eliminar la consulta a `home_services` y usar los datos estaticos.

### 7. Modificar Servicios.tsx (pagina)
Eliminar la consulta a `home_services` y usar los datos estaticos.

### 8. Eliminar preloadGalleryImages() de App.tsx
Ya no es necesario precargar porque los datos son estaticos.

### 9. Simplificar useVideoPreloader
Ya no necesita esperar a que se carguen datos de la DB; puede tomar las URLs de video directamente de los datos estaticos.

## Consultas que se mantienen (necesarias)

- **Equipos (catalogo completo):** datos operativos (precios, stock, disponibilidad) que el cache de 24hs ya maneja bien.
- **SearchBar:** necesita datos actualizados para buscar. Ya tiene cache.
- **Blog:** contenido editorial que cambia con frecuencia.
- **Admin pages:** necesitan datos en tiempo real para gestion.

## Resultado esperado

- **Pagina Home:** 0 consultas a la nube (antes: 3 - gallery_images, equipment featured, home_services)
- **Pagina Servicios:** 0 consultas (antes: 1 - home_services)  
- **Pagina Galeria:** 0 consultas (antes: 1 via useGalleryImages)
- **Pagina Contacto:** 0 consultas (antes: 1 via useGalleryImages)
- **Pagina Cartoni:** 0 consultas (antes: 1 via useGalleryImages)
- **Pagina Sala Grabacion:** 0 consultas (antes: 1 via useGalleryImages)
- **Pagina Equipos:** se mantienen las consultas con cache (datos operativos necesarios)

## Nota importante

Cuando el admin haga cambios en gallery_images, servicios o equipos destacados desde el panel, habra que actualizar manualmente estos archivos estaticos. Como alternativa, se puede dejar un comentario claro en cada archivo indicando de donde se sacaron los datos y como regenerarlos.

## Detalles tecnicos

- Los archivos de datos estaticos se crean en `src/data/`
- Se mantiene la misma interfaz de los hooks para no romper ningun componente
- Los datos se toman del response actual de la API (visible en network requests)
- Se elimina la dependencia de `supabase` en todos los componentes de presentacion publica (no admin)
