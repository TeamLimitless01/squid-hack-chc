"use client";

import { useState } from "react";
import { X, Calculator, Plus, Trash2, Loader2, Send } from "lucide-react";
import { sendBookingProposal } from "@/app/actions/proposals";

type Charge = { id: string; reason: string; amount: string };

export default function ProposalModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const basePrice = booking.chcService.price * booking.area;

  const [charges, setCharges] = useState<Charge[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addCharge = () => {
    setCharges([...charges, { id: Math.random().toString(), reason: "", amount: "" }]);
  };

  const removeCharge = (id: string) => {
    setCharges(charges.filter(c => c.id !== id));
  };

  const updateCharge = (id: string, field: "reason" | "amount", value: string) => {
    setCharges(charges.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const totalCharges = charges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const finalAmount = basePrice + totalCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate charges
    const invalidCharges = charges.some(c => !c.reason.trim() || !c.amount || parseFloat(c.amount) <= 0);
    if (invalidCharges) {
      setError("Please ensure all additional charges have a reason and a valid amount greater than 0.");
      setIsSubmitting(false);
      return;
    }

    const payloadCharges = charges.map(c => ({
      reason: c.reason,
      amount: parseFloat(c.amount)
    }));

    const res = await sendBookingProposal(booking.id, basePrice, finalAmount, payloadCharges);

    if (res.success) {
      onClose(); // In a real app we might want to trigger a re-fetch or optimistically update
    } else {
      setError(res.error || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">Send Proposal</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Review request from {booking.farmer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95 bg-white border border-slate-200 shadow-sm">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-100">{error}</div>}

          {/* Base Price Summary */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex justify-between items-center mb-6">
            <div>
              <p className="text-emerald-800 font-bold text-sm uppercase tracking-wider mb-1">Base Service Cost</p>
              <p className="text-emerald-600 font-semibold">{booking.area} {booking.chcService.pricingUnit.toLowerCase()}s × ₹{booking.chcService.price}</p>
            </div>
            <p className="text-2xl font-black text-emerald-900">₹{basePrice.toLocaleString('en-IN')}</p>
          </div>

          {/* Additional Charges */}
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 text-sm uppercase tracking-wider">Additional Charges</label>
              <button type="button" onClick={addCharge} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add Charge
              </button>
            </div>

            {charges.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium italic p-4 text-center border border-dashed border-slate-200 rounded-xl">No additional charges. Base price will be quoted.</p>
            ) : (
              <div className="space-y-3">
                {charges.map(charge => (
                  <div key={charge.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Reason (e.g. Travel fee)"
                      value={charge.reason}
                      onChange={e => updateCharge(charge.id, "reason", e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="0"
                        value={charge.amount}
                        onChange={e => updateCharge(charge.id, "amount", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <button type="button" onClick={() => removeCharge(charge.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6 mb-8 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-700 flex items-center gap-2"><Calculator className="w-5 h-5 text-emerald-600" /> Final Quote Amount</span>
            <span className="text-3xl font-black text-slate-900">₹{finalAmount.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><Send className="w-5 h-5" /> Send Proposal to Farmer</>}
          </button>
        </form>
      </div>
    </div>
  );
}
