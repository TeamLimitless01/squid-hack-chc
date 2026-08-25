"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={customIcon} draggable={true} eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setPosition(position);
        map.flyTo(position, map.getZoom());
      },
    }} />
  );
}

export default function LocationPickerMap({ 
  initialLat, 
  initialLon, 
  onConfirm, 
  onCancel 
}: { 
  initialLat?: number; 
  initialLon?: number; 
  onConfirm: (lat: number, lon: number) => void;
  onCancel: () => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLon ? new L.LatLng(initialLat, initialLon) : null
  );

  // Default to a central location (e.g., center of India) if no initial location
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const center = position ? [position.lat, position.lng] as [number, number] : defaultCenter;
  const zoom = position ? 13 : 5;

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-3 shadow-xl p-2 bg-white/90 backdrop-blur-md rounded-2xl">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="button"
          onClick={() => {
            if (position) onConfirm(position.lat, position.lng);
          }}
          disabled={!position}
          className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          Confirm Location
        </button>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
