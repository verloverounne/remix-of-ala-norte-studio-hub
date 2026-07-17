
## Ajuste

Items 11 y 13 se tratan como existentes → **no se insertan** (ya están en la base con nombre con `"` extra; no se toca ese nombre).

## Equipos a insertar (11)

| # | Nombre | Categoría CSV | Stock | Status | Subcategoría resuelta |
|---|---|---|---|---|---|
| 1 | Mattebox Clip on Kondor Blue Triple Stage 4x5.65" | Accesorios de camara | 3 | available | Accesorios Cámara (mapeo) |
| 2 | Maquina de humo mediana 1200w | Accesorios iluminación y grip | 1 | available | — (revisión manual) |
| 3 | Softbox Bowens Aputure Light Dome III 35.1" | Accesorios iluminación y grip | 1 | available | LED (keyword `softbox`) |
| 4 | Softbox Bowens Aputure Light Dome Mini III 22.8" | Accesorios iluminación y grip | 1 | available | LED (keyword `softbox`) |
| 5 | Cámara RED Epic Dragon 6K | Camaras | 1 | available | Cuerpos de Cámara (mapeo) |
| 6 | Sony FX9 (1) | Camaras | 2 | available | Cuerpos de Cámara (mapeo) |
| 7 | HMI Desisti 575 Par | Faroles HMI | 3 | available | LED (keyword `hmi`) |
| 8 | Dto Kit valija Leica R x 7 lentes | Lentes | 1 | available | Lentes (mapeo) |
| 9 | Lente Leica R 180mm f/2.8 | Lentes | 1 | available | Lentes (mapeo) |
| 10 | Monitor 32" HDMI | Monitoreo / EVF / Transmisores Wireless | 0 | maintenance | Monitoreo/EVF/Transmisores (mapeo) |
| 12 | Monitor Panasonic HD 17" Wave Form SDI | Monitoreo / EVF / Transmisores Wireless | 2 | available | Monitoreo/EVF/Transmisores (mapeo) |

## Ejecución

1. Resolver `category_id` / `subcategory_id` leyendo `categories` y `subcategories` (script en modo build).
2. `INSERT` batch en `equipment` con: `name`, `category_id`, `subcategory_id`, `price_per_day` (primera fila del grupo), `stock_quantity`, `status`, `ownership_type` (tipo dominante), `subcategory_auto_assigned = true`, `category_manually_edited = false`.
3. No se modifica ni borra ningún equipo existente.
4. Reporte al finalizar: cuántos insertados y cuáles quedaron sin subcategoría (item 2) para revisar en `Admin → Autoasignados`.
