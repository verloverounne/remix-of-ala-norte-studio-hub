import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiMjY0NDczNDEiLCJhIjoiY21tb3p5bHI0MGN6ZzJzb2dobHV4YzJrbyJ9.3usO-yDTM7bBSjUNbt4a1g';

const ALA_NORTE = {
  address: 'V. S. de Liniers 1565, Vicente López, Buenos Aires, Argentina',
  latitude: -34.5445,
  longitude: -58.4716,
};

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [ALA_NORTE.longitude, ALA_NORTE.latitude],
      zoom: 15,
    });

    new mapboxgl.Marker({ color: '#9b87f5' })
      .setLngLat([ALA_NORTE.longitude, ALA_NORTE.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<div style="padding: 8px; color: #000;"><strong>Ala Norte Cine Digital</strong><br/>${ALA_NORTE.address}</div>`)
      )
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map;
