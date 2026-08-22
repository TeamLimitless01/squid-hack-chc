"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, Handshake, XCircle } from "lucide-react";
import { approveProposal, rejectProposalByFarmer } from "@/app/actions/proposals";

export default function ReviewProposalModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError("");

    const res = await approveProposal(booking.id);
    
    if (res.success) {
      onClose(); // Parent component should ideally reload or update state
    } else {
      setError(res.error || "Failed to approve proposal.");
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    setError("");

    const res = await rejectProposalByFarmer(booking.id);
    
    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Failed to reject proposal.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">Review Proposal</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">From {booking.chc.centerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95 bg-white border border-slate-200 shadow-sm">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-100">{error}</div>}

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="font-bold text-slate-600">Base Service Cost</span>
              <span className="font-bold text-slate-900 text-lg">₹{booking.vpBasePrice?.toLocaleString('en-IN') || 0}</span>
            </div>

            {booking.additionalCharges && booking.additionalCharges.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Charges</p>
                {booking.additionalCharges.map((charge: any) => (
                  <div key={charge.id} className="flex justify-between items-center text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span>{charge.reason}</span>
                    <span className="font-bold text-slate-900">₹{charge.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex justify-between items-center mb-8">
            <span className="text-lg font-bold text-emerald-800 flex items-center gap-2"><Handshake className="w-5 h-5" /> Final Quote</span>
            <span className="text-3xl font-black text-emerald-900">₹{booking.vpFinalAmount?.toLocaleString('en-IN') || 0}</span>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex-1 bg-white text-rose-600 border border-rose-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-50 hover:shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><XCircle className="w-5 h-5" /> Reject</>}
            </button>
            <button 
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Approving...</> : <><CheckCircle2 className="w-5 h-5" /> Accept Proposal</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
