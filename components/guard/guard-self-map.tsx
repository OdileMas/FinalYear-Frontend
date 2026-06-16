"use client";

// ============================================================================
// GuardSelfMap — Guard's own position mini-map (Phase 1)
// Loaded dynamically (ssr: false) from guard/page.tsx
// Displays a single Leaflet marker at the guard's current GPS coordinates
// ============================================================================

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path broken by webpack/Next.js bundling
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Sub-component that re-centres the map whenever the guard moves
function MapRecentrer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface GuardSelfMapProps {
  lat: number;
  lng: number;
}

export default function GuardSelfMap({ lat, lng }: GuardSelfMapProps) {
  return (
    <div className="h-40 w-full rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapRecentrer lat={lat} lng={lng} />
        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>
            <span className="text-xs font-medium">You are here</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
