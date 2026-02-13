'use client';

import { useEffect, useRef } from 'react';
import type { Property } from '@/types';

interface Props {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
}

export default function PropertyMap({ properties, center = [6.5244, 3.3792], zoom = 12 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamic import for Leaflet (SSR-safe)
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current!).setView(center, zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          L.marker([property.latitude, property.longitude])
            .addTo(map)
            .bindPopup(`
              <strong>${property.title}</strong><br/>
              ${property.formatted_price}<br/>
              <a href="/properties/${property.slug}">View Details</a>
            `);
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, center, zoom]);

  return <div ref={mapRef} className="h-full w-full min-h-[400px] rounded-lg" />;
}
