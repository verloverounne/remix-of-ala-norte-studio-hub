

## Plan: Restaurar carga dinámica de Gallery Images y Spaces con caché de 24h

### Objetivo
Volver a cargar `gallery_images` y `spaces` desde la base de datos (editables desde el panel Admin existente), pero usando caché localStorage de 24 horas para minimizar consultas.

### Cambios

#### 1. Actualizar `useGalleryImages.tsx` — fetch dinámico con caché
- Reemplazar la importación estática por una query a `gallery_images` con caché de 24h
- Al montar: verificar `localStorage` → si hay datos válidos, usarlos; si no, fetch de Supabase y guardar en caché
- Mantener la misma interfaz (`images`, `loading`, `getByPageType`)
- Usar las utilidades existentes de `src/lib/cache.ts` (`getCache`, `setCache`, `CACHE_KEYS.GALLERY_IMAGES`)

#### 2. Crear hook `useSpace.tsx` — fetch dinámico de spaces con caché
- Nuevo hook `useSpace(slug: string)` que busca en `spaces` table por slug
- Caché por slug en localStorage (key: `space_${slug}`, TTL 24h)
- Retorna `{ space, loading }`
- Agregar `SPACES` a `CACHE_KEYS` en `cache.ts`

#### 3. Actualizar páginas consumidoras
- **`Galeria.tsx`**: reemplazar `GALERIA_SPACE` por `useSpace("galeria")`
- **`SalaGrabacion.tsx`**: reemplazar `SALA_GRABACION_SPACE` por `useSpace("sala-grabacion")`
- Agregar estado de loading mientras carga el space

#### 4. Invalidar caché desde Admin
- En `GalleryManager.tsx`: llamar `invalidateCache('GALLERY_IMAGES')` después de cada operación CRUD
- En `SpaceAdminEditor.tsx`: llamar `clearCache('space_galeria')` y `clearCache('space_sala-grabacion')` después de guardar cambios
- Agregar key `SPACES` a `CACHE_KEYS`

#### 5. Actualizar `useVideoPreloader.tsx`
- Ya depende de `useGalleryImages` → funcionará automáticamente cuando el hook vuelva a ser dinámico, solo necesita manejar el estado `loading` antes de intentar precargar videos

#### 6. Limpieza
- El archivo `src/data/galleryData.ts` se puede mantener como fallback o eliminar
- `src/data/spaces.ts` se mantiene como fallback para cuando no hay datos en caché ni conexión

### Resultado
- **Consultas por sesión**: máximo 2 (gallery_images + space por slug), solo si el caché expiró (cada 24h)
- **Admin**: los cambios se reflejan inmediatamente en la misma sesión (invalidación de caché), y para otros usuarios dentro de 24h
- **Fallback**: datos estáticos existentes si la query falla

