"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Component to adjust bounds when there are multiple markers
function MapBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

export default function MapComponent({
  lat, lon, name, farmerLat, farmerLon
}: {
  lat: number, lon: number, name: string, farmerLat?: number, farmerLon?: number
}) {
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null);

  useEffect(() => {
    // Fix for default marker icon in Next.js/Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    async function fetchRoute() {
      if (farmerLat && farmerLon && farmerLat !== 0 && farmerLon !== 0) {
        try {
          // OSRM expects coordinates in lon,lat order
          const url = `https://router.project-osrm.org/route/v1/driving/${lon},${lat};${farmerLon},${farmerLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.routes && data.routes.length > 0) {
            // OSRM returns coordinates as [lon, lat], Leaflet wants [lat, lon]
            const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            setRoutePath(coords);
          }
        } catch (error) {
          console.error("Failed to fetch route:", error);
        }
      }
    }
    fetchRoute();
  }, [lat, lon, farmerLat, farmerLon]);

  // Custom green icon for the farmer
  const farmerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const hasFarmerLocation = farmerLat && farmerLon && farmerLat !== 0 && farmerLon !== 0;

  // Calculate bounds if we have both locations
  const bounds: L.LatLngBoundsExpression | null = hasFarmerLocation
    ? [
      [lat, lon],
      [farmerLat, farmerLon]
    ]
    : null;

  return (
    <MapContainer center={[lat, lon]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* CHC Marker (Default Blue) */}
      <Marker position={[lat, lon]}>
        <Popup>
          <div className="font-bold">{name} (Provider)</div>
        </Popup>
      </Marker>

      {/* Farmer Marker (Green) */}
      {hasFarmerLocation && (
        <>
          <Marker position={[farmerLat, farmerLon]} icon={farmerIcon}>
            <Popup>
              <div className="font-bold">Your Farm</div>
            </Popup>
          </Marker>

          {/* Render real roads route if loaded, otherwise fallback to straight dashed line */}
          {routePath ? (
            <Polyline
              positions={routePath}
              pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
            />
          ) : (
            <Polyline
              positions={bounds!}
              pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10' }}
            />
          )}

          {/* Adjust bounds to fit both markers */}
          <MapBounds bounds={bounds!} />
        </>
      )}
    </MapContainer>
  );
}
