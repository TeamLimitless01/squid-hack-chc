"use client";

import { useState, useEffect } from "react";
import { X, UserRound, Tractor, CheckCircle2, Loader2 } from "lucide-react";
import { getCHCDrivers } from "@/app/actions/chc-booking-actions";
import { assignBookingResources } from "@/app/actions/assignments";

export default function AssignResourcesModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchDrivers() {
      const data = await getCHCDrivers();
      setDrivers(data);
      if (data.length > 0) setSelectedDriverId(data[0].id);
      setIsLoadingDrivers(false);
    }
    fetchDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      setError("Please select a driver first.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const res = await assignBookingResources(booking.id, selectedDriverId);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || "Failed to assign resources.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">{booking.assignedDriver ? "Change Resources" : "Assign Resources"}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">For {booking.farmer.name}'s Request</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95 bg-white border border-slate-200 shadow-sm">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-100">{error}</div>}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Assigned Successfully!</h3>
              <p className="text-slate-500 mt-2 font-medium">Driver and equipment have been linked.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-emerald-600" /> Assign Driver
                </label>
                {isLoadingDrivers ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your drivers...
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-sm font-bold">
                    You have no drivers registered. Please add a driver from the dashboard.
                  </div>
                ) : (
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.user.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-emerald-600" /> Equipment Auto-Assignment
                </label>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-800 leading-relaxed">
                    The system will automatically find available equipment for this service and lock it for the booking date ({new Date(booking.bookingDate).toLocaleDateString('en-GB')}).
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || drivers.length === 0}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> {booking.assignedDriver ? "Confirm New Assignment" : "Confirm Assignment"}</>}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
