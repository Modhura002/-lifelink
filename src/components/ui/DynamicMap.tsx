'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons matching the design system
const createCustomIcon = (type: 'patient' | 'hospital' | 'ambulance', label?: string) => {
  const bgColors = {
    patient: 'bg-blue-500',
    hospital: 'bg-red-500',
    ambulance: 'bg-amber-500',
  };

  const svgs = {
    patient: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    hospital: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
    ambulance: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  };

  const html = `
    <div class="relative flex flex-col items-center">
      <div class="relative w-10 h-10 rounded-full ${bgColors[type]} flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 z-10">
        ${svgs[type]}
      </div>
      ${label ? `<div class="absolute top-11 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-20 font-medium">${label}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to handle map centering when center prop changes
function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), {
      animate: true,
      duration: 1.5,
    });
  }, [center, map, zoom]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export type MapMarker = {
  id: string | number;
  position: [number, number];
  type: 'patient' | 'hospital' | 'ambulance';
  label?: string;
  popup?: React.ReactNode;
};

export type DynamicMapProps = {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: Array<[number, number]>;
  className?: string;
  autoCenter?: boolean;
};

export default function DynamicMap({ center, zoom = 13, markers = [], route = [], className = '', autoCenter = true }: DynamicMapProps) {
  return (
    <div className={`w-full h-full relative isolate ${className}`}>
      {/* 
        To maintain the dark mode aesthetic, we apply CSS filters to the tile layer.
        This gives OpenStreetMap a dark, high-contrast look suitable for emergency tracking. 
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .dark .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-container {
          background: #0f172a;
          font-family: inherit;
        }
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
      `}} />
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapResizer />
        {autoCenter && <MapController center={center} zoom={zoom} />}

        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="#ef4444" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.6} 
          />
        )}

        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position} 
            icon={createCustomIcon(marker.type, marker.label)}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
