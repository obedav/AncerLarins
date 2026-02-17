'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { MapProperty } from '@/types';
import { formatPriceShort } from '@/lib/utils';

interface Props {
  properties: MapProperty[];
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export default function PropertyMap({
  properties,
  center = [6.5244, 3.3792],
  zoom = 12,
  onBoundsChange,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;

  const emitBounds = useCallback((map: any) => {
    if (!onBoundsChangeRef.current) return;
    if (!map || !map.getContainer() || !map.getSize().x) return;
    try {
      map.invalidateSize({ animate: false });
      const b = map.getBounds();
      onBoundsChangeRef.current({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    } catch {
      // Map not ready or already removed
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let cancelled = false;

    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapRef.current, { zoomControl: true }).setView(center, zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Emit bounds on move/zoom
      map.on('moveend', () => emitBounds(map));

      // Initial bounds — defer until container has layout
      const tryEmit = () => {
        if (cancelled) return;
        if (map.getSize().x > 0) {
          emitBounds(map);
        } else {
          requestAnimationFrame(tryEmit);
        }
      };
      map.whenReady(() => requestAnimationFrame(tryEmit));
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom, emitBounds]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove old markers
      if (markersRef.current) {
        markersRef.current.forEach((m: any) => map.removeLayer(m));
      }

      const markers: any[] = [];

      properties.forEach((property) => {
        if (!property.latitude || !property.longitude) return;

        const priceLabel = formatPriceShort(property.price_kobo);
        const isRent = property.listing_type === 'rent';

        // Custom price-label marker (Zillow style)
        const icon = L.divIcon({
          className: 'property-marker',
          html: `<div style="
            background: ${isRent ? '#1a365d' : '#276749'};
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
            cursor: pointer;
          ">${priceLabel}</div>`,
          iconSize: [0, 0],
          iconAnchor: [30, 15],
        });

        const marker = L.marker([property.latitude, property.longitude], { icon });

        // Popup with property card
        const specs = [
          property.bedrooms !== null ? `${property.bedrooms} Bed` : null,
          property.bathrooms !== null ? `${property.bathrooms} Bath` : null,
        ].filter(Boolean).join(' &middot; ');

        const popup = L.popup({ maxWidth: 260, closeButton: true }).setContent(`
          <div style="font-family: system-ui, sans-serif; min-width: 200px;">
            <div style="font-weight: 700; font-size: 16px; color: #1a365d; margin-bottom: 4px;">
              ${priceLabel}${isRent ? '<span style="font-weight: 400; font-size: 12px; color: #666;">/' + (property.listing_type === 'rent' ? 'yr' : '') + '</span>' : ''}
            </div>
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px; color: #333;">
              ${property.title}
            </div>
            ${specs ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;">${specs}</div>` : ''}
            <a href="/properties/${property.slug}?ref=map"
               style="display: inline-block; background: #25D366; color: white; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;">
              View Property
            </a>
          </div>
        `);

        marker.bindPopup(popup);
        marker.addTo(map);
        markers.push(marker);
      });

      markersRef.current = markers;
    });
  }, [properties]);

  return (
    <>
      <style jsx global>{`
        .property-marker { background: transparent !important; border: none !important; }
      `}</style>
      <div ref={mapRef} className="h-full w-full min-h-[400px] rounded-xl" />
    </>
  );
}
