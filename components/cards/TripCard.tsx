"use client";

import { useState } from "react";
import { Loader2, Navigation, Tractor, CheckCircle2, MapPin, Calendar as CalendarIcon, ArrowRight, Map, Clock, Banknote } from "lucide-react";
import { startTrip, startWork, endWork, closeJob, confirmCashAndCloseJob } from "@/app/actions/driver-trips";
import MapModal from "@/components/map/MapModal";

export default function TripCard({ booking, type }: { booking: any, type: "today" | "upcoming" | "completed" | "working" }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleAction = async (actionFn: (id: string) => Promise<any>) => {
    setIsProcessing(true);
    setError("");
    try {
      const res = await actionFn(booking.id);
      if (!res.success) {
        setError(res.error || "Action failed.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (booking.workCompleteTime) {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
    }
    if (booking.workStatus === "COMPLETED") {
      if (booking.payment?.status === "PAID") {
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
      }
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200"><Clock className="w-3 h-3" /> Payment Pending</span>;
    }
    if (booking.workStatus === "IN_PROGRESS") {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200"><Tractor className="w-3 h-3" /> Working</span>;
    }
    if (booking.tripStatus === "STARTED") {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200"><Navigation className="w-3 h-3" /> On The Way</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200"><CalendarIcon className="w-3 h-3" /> Scheduled</span>;
  };

  const renderActionButton = () => {
    if (booking.workCompleteTime) return null;
    if (type !== "today" && type !== "working") return null;

    if (booking.workStatus === "COMPLETED") {
      if (booking.payment?.status === "CASH_PENDING") {
        return (
          <button 
            onClick={() => handleAction(confirmCashAndCloseJob)}
            disabled={isProcessing}
            className="w-full mt-4 bg-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-70 active:scale-95 shadow-lg shadow-emerald-600/20"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Banknote className="w-5 h-5" /> Confirm Cash & Close Job</>}
          </button>
        );
      } else if (booking.payment?.status !== "PAID") {
        return (
          <button 
            disabled
            className="w-full mt-4 bg-slate-100 text-slate-400 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed"
          >
            <Clock className="w-5 h-5" /> Waiting for Farmer Payment
          </button>
        );
      } else {
        return (
          <button 
            onClick={() => handleAction(closeJob)}
            disabled={isProcessing}
            className="w-full mt-4 bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70 active:scale-95 shadow-lg shadow-slate-900/20"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Close Job</>}
          </button>
        );
      }
    }

    if (booking.tripStatus === "NOT_STARTED") {
      return (
        <button 
          onClick={() => handleAction(startTrip)}
          disabled={isProcessing}
          className="w-full mt-4 bg-amber-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-70 active:scale-95"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Navigation className="w-5 h-5" /> Start Trip (Leave CHC)</>}
        </button>
      );
    }

    if (booking.tripStatus === "STARTED" && booking.workStatus === "NOT_STARTED") {
      return (
        <button 
          onClick={() => handleAction(startWork)}
          disabled={isProcessing}
          className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70 active:scale-95 shadow-lg shadow-blue-600/20"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Tractor className="w-5 h-5" /> Arrived & Start Work</>}
        </button>
      );
    }

    if (booking.workStatus === "IN_PROGRESS") {
      return (
        <button 
          onClick={() => handleAction(endWork)}
          disabled={isProcessing}
          className="w-full mt-4 bg-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-70 active:scale-95 shadow-lg shadow-emerald-600/20"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Work Complete</>}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${type === 'today' ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-200'} p-5 relative overflow-hidden transition-all hover:shadow-md`}>
      {type === 'today' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{booking.chcService.service.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {booking.farmer.address || "Farm Location"}, {booking.farmer.city || ""}</p>
            {booking.farmer?.location && booking.chc?.location && (
              <button 
                onClick={() => setIsMapOpen(true)}
                className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition flex items-center gap-1"
              >
                <Map className="w-3 h-3" /> Map
              </button>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Date & Time
          </p>
          <p className="font-bold text-slate-800">{new Date(booking.bookingDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Workload</p>
          <p className="font-bold text-slate-800">{booking.area} {booking.chcService.pricingUnit}s</p>
        </div>
        <div className="col-span-2 pt-3 border-t border-slate-200/60 mt-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Farmer Contact</p>
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800">{booking.farmer.name}</p>
            <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{booking.farmer.phone}</p>
          </div>
        </div>
      </div>

      {booking.assignedResources && booking.assignedResources.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {booking.assignedResources.map((res: any) => (
            <span key={res.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg">
              <Tractor className="w-3 h-3" />
              {res.equipment.name} ({res.equipment.registrationNumber})
            </span>
          ))}
        </div>
      )}

      {error && <div className="mt-2 text-rose-600 text-sm font-bold bg-rose-50 p-2 rounded-lg">{error}</div>}
      
      {renderActionButton()}

      {isMapOpen && booking.farmer?.location && booking.chc?.location && (
        <MapModal
          lat={booking.farmer.location.lat}
          lon={booking.farmer.location.lng || booking.farmer.location.lon}
          name={booking.farmer.name}
          farmerLat={booking.chc.location.lat}
          farmerLon={booking.chc.location.lng || booking.chc.location.lon}
          onClose={() => setIsMapOpen(false)}
        />
      )}
    </div>
  );
}
