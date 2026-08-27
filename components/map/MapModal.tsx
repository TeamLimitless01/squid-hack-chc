"use client";

import dynamic from "next/dynamic";
import { X, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { pusherClient } from "@/src/lib/pusher";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse text-gray-500">Loading Map...</div> });

export default function MapModal({ lat, lon, name, farmerLat, farmerLon, bookingId, onClose }: { lat: number, lon: number, name: string, farmerLat?: number, farmerLon?: number, bookingId?: string, onClose: () => void }) {
  const [driverLat, setDriverLat] = useState<number | undefined>();
  const [driverLon, setDriverLon] = useState<number | undefined>();

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  useEffect(() => {
    if (bookingId && pusherClient) {
      const channelName = `booking-${bookingId}`;
      const channel = pusherClient.subscribe(channelName);

      channel.bind("location-update", (data: { lat: number, lon: number }) => {
        setDriverLat(data.lat);
        setDriverLon(data.lon);
      });

      return () => {
        channel.unbind("location-update");
        pusherClient?.unsubscribe(channelName);
      };
    }
  }, [bookingId]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[75vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10 relative">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">{name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 w-full bg-gray-50 relative z-0">
          <MapComponent lat={lat} lon={lon} name={name} farmerLat={farmerLat} farmerLon={farmerLon} driverLat={driverLat} driverLon={driverLon} />
        </div>
      </div>
    </div>
  );
}
