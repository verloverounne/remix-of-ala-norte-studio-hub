# Plan de Migración: DonWeb + Supabase Externo

Migración completa del sitio Ala Norte Studio desde Lovable Cloud a infraestructura propia: hosting estático en **DonWeb** y backend en una cuenta **Supabase externa** (propia, no gestionada por Lovable).

---

## Resumen del estado actual

- **Frontend:** React 18 + Vite 5 + TypeScript (build estático, sin SSR).
- **Backend (Lovable Cloud):** proyecto Supabase `svpfonykqarvvghanoaa` con:
  - 24 tablas (equipment, categories, subcategories, gallery_images, spaces, quotes, reservations, blog_articles, profiles, user_roles, contact_info, home_services, service_sections, services_hero, equipos_hero_config, equipment_images, equipment_availability, equipment_unavailability, equipment_recommendations, space_unavailability, blog_categories, design_tokens, etc.)
  - 3 storage buckets: `equipment-images` (público), `images` (privado), `publicimages` (público)
  - 3 funciones (`handle_new_user`, `has_role`, `update_updated_at_column`) + enum `app_role`
  - RLS habilitado en todas las tablas
  - Auth con email/password y trigger en `auth.users`
  - Sin Edge Functions desplegadas actualmente
- **Variables de entorno usadas en código:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

---

## FASE 1 — Crear el nuevo proyecto Supabase externo

1. Crear cuenta en [supabase.com](https://supabase.com) (si no existe) y un nuevo proyecto en la región más cercana (São Paulo recomendada para Argentina).
2. Anotar los nuevos valores: `Project URL`, `anon key`, `service_role key`, `Project Ref`, `DB password`.
3. Instalar la **Supabase CLI** localmente:
   ```bash
   npm i -g supabase
   supabase login
   ```

## FASE 2 — Exportar el esquema y los datos actuales

Hay dos rutas; recomiendo combinar ambas para máxima fidelidad.

**Ruta A — Volcado SQL completo (preferida, preserva todo):**
1. Obtener la cadena de conexión del proyecto actual (`SUPABASE_DB_URL`, ya disponible como secret).
2. Volcar esquema y datos del schema `public`:
   ```bash
   pg_dump "$OLD_DB_URL" \
     --schema=public \
     --no-owner --no-privileges \
     --file=alanorte_full.sql
   ```
3. Volcar el schema `auth` solo en formato datos (usuarios + identidades), no la estructura:
   ```bash
   pg_dump "$OLD_DB_URL" --data-only \
     --table=auth.users --table=auth.identities \
     --file=alanorte_auth_users.sql
   ```
4. Volcar `storage.objects` metadata (luego se re-suben los archivos):
   ```bash
   pg_dump "$OLD_DB_URL" --data-only \
     --table=storage.buckets --table=storage.objects \
     --file=alanorte_storage_meta.sql
   ```

**Ruta B — Backup JSON de respaldo:** usar el panel admin existente (`Admin → Backups`) que ya genera JSON/CSV de las tablas — sirve como copia humana legible y de seguridad.

## FASE 3 — Importar a la nueva Supabase

1. **Recrear enums y funciones primero** (la CLI puede tener problemas si los enums no existen):
   - Crear `app_role` enum
   - Recrear funciones `handle_new_user`, `has_role`, `update_updated_at_column`
2. Aplicar el dump:
   ```bash
   psql "$NEW_DB_URL" -f alanorte_full.sql
   ```
3. Importar usuarios de auth:
   ```bash
   psql "$NEW_DB_URL" -f alanorte_auth_users.sql
   ```
   Nota: las contraseñas hasheadas se preservan; los usuarios podrán iniciar sesión con sus mismas credenciales.
4. Re-crear el trigger `on_auth_user_created` que invoca `handle_new_user` (no se exporta automáticamente por estar en schema `auth`).
5. Verificar RLS activo en todas las tablas y que las políticas se hayan migrado.

## FASE 4 — Migrar Storage (archivos)

Los buckets `equipment-images`, `images`, `publicimages` contienen imágenes/videos referenciados por URL en la BD.

1. **Recrear los 3 buckets** en el nuevo proyecto con la misma configuración pública/privada.
2. **Copiar archivos** con un script Node usando ambos service-role keys:
   ```js
   // Lista del viejo, descarga, sube al nuevo, preservando paths
   ```
3. **Actualizar URLs en la BD:** las URLs públicas tienen formato `https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/...`. Hacer un `UPDATE` masivo reemplazando el subdominio viejo por el nuevo en columnas: `equipment.image_url`, `equipment.images`, `gallery_images.image_url`, `gallery_images.vertical_video_url`, `spaces.images`, `spaces.featured_image`, `spaces.video_url`, `equipment_images.image_url`, `home_services.*_url`, `services_hero.hero_media_url`, `equipos_hero_config.media_url`, `blog_articles.image_url`.

## FASE 5 — Adaptar el código

1. **Reemplazar `src/integrations/supabase/client.ts`** (que actualmente lee de `import.meta.env`) por una versión equivalente apuntando a las nuevas vars. El archivo en sí puede mantenerse igual: solo cambian los valores en `.env`.
2. **Crear `.env.production`** con:
   ```
   VITE_SUPABASE_URL=https://<nuevo-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<nueva-anon-key>
   VITE_SUPABASE_PROJECT_ID=<nuevo-ref>
   ```
3. **Regenerar `src/integrations/supabase/types.ts`** con la CLI:
   ```bash
   supabase gen types typescript --project-id <nuevo-ref> > src/integrations/supabase/types.ts
   ```
4. Eliminar dependencia de `lovable-tagger` del bundle de producción (ya está condicionada a `mode === development` en `vite.config.ts`, verificar).
5. **Probar localmente** con `bun run dev` apuntado al nuevo Supabase antes de desplegar.

## FASE 6 — Desplegar en DonWeb

DonWeb ofrece hosting compartido (Apache/cPanel) y VPS. Opciones:

**Opción A — Hosting compartido cPanel (más simple, recomendada para sitios estáticos):**
1. Construir el sitio:
   ```bash
   bun install && bun run build
   ```
   Genera carpeta `dist/` con HTML/JS/CSS estáticos.
2. Subir contenido de `dist/` a `public_html/` vía FTP/File Manager de cPanel.
3. **Crear `.htaccess`** en `public_html/` para SPA routing (sin él, refrescar `/equipos` da 404):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
4. Activar SSL gratuito (Let's Encrypt) desde cPanel.
5. Configurar el dominio (apuntar A record o nameservers a DonWeb).

**Opción B — VPS DonWeb (más control):**
1. Instalar Node + Nginx en el VPS.
2. Configurar Nginx con `try_files $uri /index.html;` para SPA.
3. Servir `dist/` desde `/var/www/alanorte`.
4. Certbot para SSL.

## FASE 7 — Configurar Auth y CORS en el nuevo Supabase

1. En el dashboard del nuevo Supabase: **Authentication → URL Configuration**, agregar el dominio DonWeb como Site URL y Redirect URL.
2. Verificar plantillas de email (signup, recuperación) si se usaban personalizadas.
3. Si se usa Google OAuth, reconfigurarlo en el nuevo proyecto.

## FASE 8 — Verificación y cutover

1. Probar en staging (subdominio temporal de DonWeb): login, listado de equipos, carrito/cotizador, panel admin, carga de imágenes, galería, blog.
2. Comparar conteos de filas tabla por tabla entre origen y destino.
3. Verificar que las imágenes cargan desde el nuevo bucket.
4. Cambiar DNS al dominio definitivo.
5. Mantener el proyecto Lovable Cloud activo ~7 días como respaldo de solo lectura.

---

## Sección técnica — Detalles e inventario

**Variables a cambiar:** `.env` (3 vars), nada más en código si los nombres se mantienen.

**Tablas a migrar (24):** blog_articles, blog_categories, categories, contact_info, design_tokens, equipment, equipment_availability, equipment_images, equipment_recommendations, equipment_unavailability, equipos_hero_config, gallery_images, home_services, profiles, quote_items, quotes, reservations, service_sections, services_hero, space_unavailability, spaces, subcategories, user_roles + tipos `app_role`, `equipment_status`.

**Buckets:** equipment-images (público), images (privado), publicimages (público).

**Caché localStorage:** el código usa `getCache`/`setCache` con TTL 24h. Tras migrar, pedir a los usuarios un hard refresh o invalidar bumpeando `CACHE_KEYS`.

**Costos a considerar:**
- Supabase Free: 500 MB DB, 1 GB storage, 50K MAU. Si se supera, Pro = USD 25/mes.
- DonWeb hosting compartido: desde ~AR$ 3.000/mes; VPS desde ~AR$ 15.000/mes.

**Riesgos / advertencias:**
- Una vez migrado, **no se puede revertir** desde Lovable a Lovable Cloud sin reimportar.
- Las URLs absolutas a archivos de storage deben actualizarse o las imágenes se romperán.
- El trigger `on_auth_user_created` debe recrearse manualmente; pg_dump no lo exporta por estar en schema `auth`.
- Tras la migración, este proyecto Lovable seguirá editando código pero ya no estará conectado a la BD productiva — para nuevos cambios de schema habrá que usar la CLI de Supabase y migraciones manuales.

**Lo que NO se migra automáticamente:**
- Configuración de Auth (proveedores OAuth, plantillas de email, redirect URLs).
- Secrets de Edge Functions (no hay ninguna desplegada actualmente).
- Configuración de cron jobs / webhooks (no hay).

---

## Entregables al finalizar

1. Sitio funcionando en dominio propio servido desde DonWeb.
2. Base de datos en cuenta Supabase del cliente, con acceso total al dashboard.
3. Documento con credenciales (Supabase URL, keys, DB password, accesos cPanel/VPS).
4. Script de backup `pg_dump` programado en el VPS o instructivo para ejecutarlo manualmente.

¿Querés que arranquemos por la Fase 2 (generar el dump SQL completo desde la BD actual) y te lo deje como archivo descargable, así ya tenés el respaldo en mano antes de tocar nada?
