"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Loader2, Navigation, Map, X } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse text-gray-500 font-medium">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Map...
    </div>
  ),
});

export type LocationData = {
  address: string;
  city: string;
  state: string;
  location: { name: string; lat: number; lon: number };
};

type Props = {
  initialQuery?: string;
  initialLocation?: { lat: number; lon: number } | null;
  onLocationSelect: (data: LocationData) => void;
  placeholder?: string;
};

export default function LocationPicker({
  initialQuery = "",
  initialLocation = null,
  onLocationSelect,
  placeholder = "Search for a village, area, or city...",
}: Props) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLiveLocation, setIsGettingLiveLocation] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapError, setMapError] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          format: "json",
          addressdetails: "1",
        })}`
      );
      const place = await res.json();
      return place;
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      return null;
    }
  };

  const processPlace = (place: any) => {
    const addr = place.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || "";
    const fullAddress = place.display_name.split(",").slice(0, 2).join(",");

    const locationData: LocationData = {
      address: fullAddress,
      city,
      state,
      location: {
        name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
      },
    };

    setSearchQuery(place.display_name);
    setSuggestions([]);
    onLocationSelect(locationData);
  };

  const handleLocationSearch = (query: string) => {
    setSearchQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
            q: query,
            format: "json",
            addressdetails: "1",
            limit: "5",
            countrycodes: "in",
          })}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Location search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleFetchLiveLocation = () => {
    setMapError("");
    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingLiveLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const place = await reverseGeocode(lat, lon);
        if (place && !place.error) {
          processPlace(place);
        } else {
          setMapError("Could not resolve address for your location.");
        }
        setIsGettingLiveLocation(false);
      },
      (error) => {
        setIsGettingLiveLocation(false);
        setMapError("Unable to retrieve your location. Please check permissions.");
        console.error(error);
      }
    );
  };

  const handleMapConfirm = async (lat: number, lon: number) => {
    setIsMapModalOpen(false);
    setIsGettingLiveLocation(true);
    const place = await reverseGeocode(lat, lon);
    if (place && !place.error) {
      processPlace(place);
    } else {
      setMapError("Could not resolve address for the selected map location.");
    }
    setIsGettingLiveLocation(false);
  };

  return (
    <div className="w-full relative">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors z-10">
          <MapPin className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleLocationSearch(e.target.value)}
          className="text-gray-900 pl-11 block w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200 relative z-0"
          placeholder={placeholder}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-xl shadow-2xl rounded-xl py-2 text-base ring-1 ring-black/5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
          {suggestions.map((place, idx) => (
            <li
              key={idx}
              className="text-gray-800 cursor-default select-none relative py-2.5 px-4 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer transition-colors"
              onClick={() => processPlace(place)}
            >
              <span className="block truncate font-semibold">
                {place.display_name.split(",")[0]}
              </span>
              <span className="block truncate text-xs text-gray-500 mt-0.5">
                {place.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {mapError && (
        <p className="text-red-500 text-xs font-medium mt-2 ml-1">{mapError}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button
          type="button"
          onClick={handleFetchLiveLocation}
          disabled={isGettingLiveLocation}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {isGettingLiveLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Fetch Live Location
        </button>

        <span className="text-gray-300 text-sm">or</span>

        <button
          type="button"
          onClick={() => setIsMapModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
        >
          <Map className="w-4 h-4" />
          Choose on Map
        </button>
      </div>

      {isMapModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[75vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> Pick Location
              </h3>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-50 relative z-0">
              <LocationPickerMap
                initialLat={initialLocation?.lat}
                initialLon={initialLocation?.lon}
                onConfirm={handleMapConfirm}
                onCancel={() => setIsMapModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
