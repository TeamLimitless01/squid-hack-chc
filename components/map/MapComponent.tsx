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

const createCustomIcon = (type: 'farmer' | 'chc' | 'driver') => {
  const colors = {
    farmer: { bg: '#10b981', border: '#059669', icon: '🌾' }, // Emerald
    chc: { bg: '#3b82f6', border: '#2563eb', icon: '🏢' }, // Blue
    driver: { bg: '#f59e0b', border: '#d97706', icon: '🚜' } // Amber
  };
  const config = colors[type];
  
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${config.bg};
        border: 2px solid ${config.border};
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      ">
        ${config.icon}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 10px solid ${config.border};
        margin: -2px auto 0;
      "></div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46]
  });
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const p1 = L.latLng(lat1, lon1);
  const p2 = L.latLng(lat2, lon2);
  const dist = p1.distanceTo(p2);
  return (dist / 1000).toFixed(1); // in km
};

export default function MapComponent({
  lat, lon, name, farmerLat, farmerLon, driverLat, driverLon
}: {
  lat: number, lon: number, name: string, farmerLat?: number, farmerLon?: number, driverLat?: number, driverLon?: number
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

  const hasFarmerLocation = farmerLat && farmerLon && farmerLat !== 0 && farmerLon !== 0;
  const hasDriverLocation = driverLat && driverLon && driverLat !== 0 && driverLon !== 0;

  // Calculate bounds if we have locations
  const boundsPoints: [number, number][] = [[lat, lon]];
  if (hasFarmerLocation) boundsPoints.push([farmerLat, farmerLon]);
  if (hasDriverLocation) boundsPoints.push([driverLat, driverLon]);
  
  const bounds: L.LatLngBoundsExpression | null = boundsPoints.length > 1 ? boundsPoints : null;

  // Distances
  const driverToFarmer = hasDriverLocation && hasFarmerLocation ? calculateDistance(driverLat, driverLon, farmerLat, farmerLon) : null;
  const driverToChc = hasDriverLocation ? calculateDistance(driverLat, driverLon, lat, lon) : null;

  return (
    <MapContainer center={[lat, lon]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* CHC Marker */}
      <Marker position={[lat, lon]} icon={createCustomIcon('chc')}>
        <Popup>
          <div className="font-bold">{name} (Provider)</div>
        </Popup>
      </Marker>

      {/* Farmer Marker */}
      {hasFarmerLocation && (
        <>
          <Marker position={[farmerLat, farmerLon]} icon={createCustomIcon('farmer')}>
            <Popup>
              <div className="font-bold">Farmer Location</div>
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
              positions={[[lat, lon], [farmerLat, farmerLon]]}
              pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10' }}
            />
          )}
        </>
      )}

      {/* Driver Marker */}
      {hasDriverLocation && (
        <Marker position={[driverLat, driverLon]} icon={createCustomIcon('driver')}>
          <Popup>
            <div className="font-bold">Driver (Tractor)</div>
          </Popup>
        </Marker>
      )}

      {/* Adjust bounds to fit all markers */}
      {bounds && <MapBounds bounds={bounds} />}

      {/* Distances Panel Overlay */}
      {hasDriverLocation && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h4 className="font-bold text-slate-800 text-sm mb-2">Live Distances</h4>
          {driverToFarmer && (
            <div className="flex items-center justify-between gap-4 text-sm mb-1">
              <span className="text-slate-500">To Farmer:</span>
              <span className="font-bold text-emerald-600">{driverToFarmer} km</span>
            </div>
          )}
          {driverToChc && (
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">To CHC:</span>
              <span className="font-bold text-blue-600">{driverToChc} km</span>
            </div>
          )}
        </div>
      )}
    </MapContainer>
  );
}
