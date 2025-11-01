import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MapProps {
  address: string;
  latitude: number;
  longitude: number;
}

const Map: React.FC<MapProps> = ({ address, latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || isMapInitialized) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 15,
      });

      // Add marker
      new mapboxgl.Marker({ color: '#9b87f5' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 8px;"><strong>Ala Norte Cine Digital</strong><br/>${address}</div>`)
        )
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      setIsMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, address, latitude, longitude, isMapInitialized]);

  if (!mapboxToken) {
    return (
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <Label htmlFor="mapbox-token" className="text-sm font-medium">
            Mapbox Public Token
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Ingresa tu token público de Mapbox para ver el mapa. 
            Obtén uno gratis en{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <Input
            id="mapbox-token"
            type="text"
            placeholder="pk...."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map;
