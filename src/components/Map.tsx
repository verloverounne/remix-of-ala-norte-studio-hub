import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiMjY0NDczNDEiLCJhIjoiY21tb3p5bHI0MGN6ZzJzb2dobHV4YzJrbyJ9.3usO-yDTM7bBSjUNbt4a1g';

interface MapProps {
  address: string;
  latitude: number;
  longitude: number;
}

const Map: React.FC<MapProps> = ({ address, latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: 15,
    });

    new mapboxgl.Marker({ color: '#9b87f5' })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<div style="padding: 8px;"><strong>Ala Norte Cine Digital</strong><br/>${address}</div>`)
      )
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [address, latitude, longitude]);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map;
