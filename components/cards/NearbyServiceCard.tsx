"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Sprout, Tractor, User, Phone, Map } from "lucide-react";
import MapModal from "@/components/map/MapModal";

export default function NearbyServiceCard({ item }: { item: any }) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all overflow-hidden flex flex-col group">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-700 transition-colors">
              {item.service.name}
            </h3>
            <p className="text-slate-500 mt-1 line-clamp-1">{item.chc.centerName}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 border border-emerald-100 shadow-sm">
            <MapPin className="w-3.5 h-3.5" />
            {item.distance.toFixed(1)} km away
          </div>
        </div>
        
        <div className="p-6 flex-1 space-y-5">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Price</p>
              <p className="text-3xl font-black text-slate-900">
                ₹{item.price.toLocaleString('en-IN')} <span className="text-base font-semibold text-slate-500">/ {item.pricingUnit.toLowerCase()}</span>
              </p>
            </div>
            
            {item.chcLat !== 0 && (
              <button 
                onClick={() => setIsMapOpen(true)}
                className="flex flex-col items-center justify-center p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                title="View on Map"
              >
                <Map className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">Map</span>
              </button>
            )}
          </div>

          {/* CHC Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Provider Details</p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{item.chc.user.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{item.chc.user.phone}</span>
            </div>
          </div>

        </div>
        
        <div className="p-6 pt-0 mt-auto">
          <Link 
            href={`/dashboard/farmer/book/${item.id}`} 
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Sprout className="w-5 h-5" /> Book Now
          </Link>
        </div>
      </div>

      {isMapOpen && (
        <MapModal 
          lat={item.chcLat} 
          lon={item.chcLon} 
          name={item.chc.centerName}
          farmerLat={item.farmerLat}
          farmerLon={item.farmerLon}
          onClose={() => setIsMapOpen(false)} 
        />
      )}
    </>
  );
}
