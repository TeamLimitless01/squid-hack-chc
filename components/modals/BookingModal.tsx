"use client";

import { useState } from "react";
import { X, Calendar, Layers, MapPin, Loader2 } from "lucide-react";
import { createBookingRequest } from "@/app/actions/booking";

export default function BookingModal({ item, onClose }: { item: any, onClose: () => void }) {
  const [bookingDate, setBookingDate] = useState("");
  const [area, setArea] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const unit = item.pricingUnit.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !area) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await createBookingRequest({
      chcServiceId: item.id,
      chcId: item.chcId,
      bookingDate: new Date(bookingDate),
      area: Number(area),
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setError(res.error || "An error occurred.");
    }
  };

  // Prevent background scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = "hidden";
  }

  const closeHandler = () => {
    document.body.style.overflow = "unset";
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-slate-50 relative">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 mb-1">Book Service</h3>
            <p className="text-slate-500 font-medium">Requesting service from {item.chc.centerName}</p>
          </div>
          <button onClick={closeHandler} className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95 bg-white shadow-sm border border-slate-100">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600 animate-[bounce_1s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Request Sent!</h3>
            <p className="text-slate-500">The CHC provider has been notified and will respond to your request shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex justify-between items-center">
              <div>
                <p className="text-emerald-800 font-bold text-lg">{item.service.name}</p>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.distance.toFixed(1)} km away
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">Price</p>
                <p className="text-2xl font-black text-emerald-900">
                  ₹{item.price.toLocaleString('en-IN')} <span className="text-sm text-emerald-700 font-semibold">/ {unit}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-semibold border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Date Needed
                </label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Can't book in past
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-all font-medium text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" /> Quantity ({unit}s)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={area}
                    onChange={e => setArea(Number(e.target.value))}
                    min={1}
                    placeholder={`e.g. 5`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-all font-medium text-slate-700 pl-4 pr-16"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                    {unit}
                  </div>
                </div>
              </div>
              
              {/* Estimated Total */}
              {area && area > 0 && (
                <div className="flex justify-between items-center py-2 px-1 border-t border-slate-100 mt-4">
                  <span className="text-slate-500 font-bold">Estimated Total</span>
                  <span className="text-xl font-black text-slate-900">₹{(item.price * (area as number)).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending Request...</>
              ) : (
                "Confirm Booking Request"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
