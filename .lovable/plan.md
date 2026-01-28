
# Plan: Hero de Rental Estático con URLs Fijas

## Resumen

Convertir el componente `HeroCarouselRental` para que use datos estáticos en lugar de consultar la base de datos. Se tomarán los datos actuales del panel por última vez y se guardarán como constantes en el código.

## Datos Actuales del Panel (Snapshot Final)

| Categoría | ID | Video URL |
|-----------|-----|-----------|
| Cámara | `4d52bbca-3bcb-4c73-ac1b-5b6d437e9163` | `...equipment-images/1768951104500_camara_fondo_blanco_gonzalo.mp4` |
| Iluminación | `f0edceff-b3b4-4735-ab37-b9e3f4bb905a` | `...equipment-images/1768951451525_luces.mp4` |
| Audio | `bdaa1e73-8532-4b85-8495-6ef8bba5be31` | `...equipment-images/1768951063587_sonido.mp4` |
| Grip | `d9e6fca2-0d23-41c8-b782-8216d97e86a5` | `...equipment-images/1768951477713_grips.mp4` |
| Energía | `efc708dd-ad95-4094-9ea6-fde7b74fe4ed` | *(sin video configurado)* |

## Cambios a Realizar

### Archivo: `src/components/rental/HeroCarouselRental.tsx`

1. **Eliminar importación de Supabase** - Ya no se necesita consultar la base de datos

2. **Crear constante estática `STATIC_HERO_BACKGROUNDS`** con el mapeo fijo:
```text
{
  "4d52bbca-3bcb-4c73-ac1b-5b6d437e9163": {  // Cámara
    id: "static-camara",
    image_url: "https://svpfonykqarvvghanoaa.supabase.co/storage/v1/object/public/equipment-images/1768951104500_camara_fondo_blanco_gonzalo.mp4",
    media_type: "video",
    title: null,
    description: null,
    order_index: 1
  },
  "f0edceff-b3b4-4735-ab37-b9e3f4bb905a": {  // Iluminación
    image_url: "...1768951451525_luces.mp4",
    media_type: "video",
    ...
  },
  "bdaa1e73-8532-4b85-8495-6ef8bba5be31": {  // Audio
    image_url: "...1768951063587_sonido.mp4",
    media_type: "video",
    ...
  },
  "d9e6fca2-0d23-41c8-b782-8216d97e86a5": {  // Grip
    image_url: "...1768951477713_grips.mp4",
    media_type: "video",
    ...
  }
}
```

3. **Eliminar estado `categoryBackgrounds` y el useEffect que hace fetch** - Reemplazar con la constante estática

4. **Eliminar estado `loading`** - Ya no hay fetch asíncrono, los datos están disponibles inmediatamente

5. **Actualizar función `getBackgroundForCategory`** - Leer directamente de la constante estática

6. **Simplificar el render** - Sin estado de carga, renderizar directamente el carousel

## Beneficios

- **Sin consultas a la base de datos** - Carga instantánea
- **Menor uso de Cloud** - Reduce costos operativos
- **Rendimiento mejorado** - No hay latencia de red
- **Base de datos intacta** - Los datos del panel permanecen sin cambios

## Consideración para Energía

La categoría "Energía" no tiene video configurado. El componente ya maneja este caso mostrando un gradiente de fallback, por lo que seguirá funcionando igual.
