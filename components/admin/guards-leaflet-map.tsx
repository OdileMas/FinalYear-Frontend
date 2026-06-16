"use client";

// ============================================================================
// GuardsLeafletMap — Renders one marker per on-duty guard
// Loaded dynamically (ssr: false) from guard-tracker-map.tsx
// ============================================================================

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GuardLocationResponse } from "@/types/auth";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const KIGALI_CENTER: [number, number] = [-1.9441, 30.0619];

interface GuardsLeafletMapProps {
  guards: GuardLocationResponse[];
}

export default function GuardsLeafletMap({ guards }: GuardsLeafletMapProps) {
  const center: [number, number] =
    guards.length > 0 ? [guards[0].latitude, guards[0].longitude] : KIGALI_CENTER;

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {guards.map((guard) => (
        <Marker key={guard.user_id} position={[guard.latitude, guard.longitude]} icon={defaultIcon}>
          <Popup>
            <span className="text-xs font-medium">{guard.guard_name}</span>
            <br />
            <span className="text-[10px] text-gray-500">
              Last seen: {new Date(guard.recorded_at).toLocaleTimeString()}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
