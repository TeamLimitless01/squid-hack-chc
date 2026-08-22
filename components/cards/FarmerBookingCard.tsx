"use client";

import { useState } from "react";
import { MapPin, Calendar, Layers, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import ReviewProposalModal from "@/components/modals/ReviewProposalModal";

export default function FarmerBookingCard({ booking }: { booking: any }) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full border border-amber-200">
            <Clock className="w-4 h-4" /> Requested
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1.5 bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full border border-red-200">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-800 text-sm font-bold px-3 py-1 rounded-full border border-slate-200">
            <AlertCircle className="w-4 h-4" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 text-sm font-bold px-3 py-1 rounded-full border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{booking.chcService.service.name}</h3>
            <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {booking.chc.centerName}
            </p>
          </div>
          <div>
            {getStatusBadge(booking.bookingStatus)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Needed</p>
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {new Date(booking.bookingDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</p>
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              {booking.area} {booking.chcService.pricingUnit.toLowerCase()}s
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rate</p>
            <p className="font-semibold text-slate-900">
              ₹{booking.chcService.price} / {booking.chcService.pricingUnit.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Total</p>
            <p className="font-black text-emerald-700 text-lg">
              ₹{(booking.vpFinalAmount || (booking.chcService.price * booking.area)).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {booking.bookingStatus === "REQUESTED" && booking.vpProposedAt && !booking.vpFarmerApproved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-bold text-sm">Proposal Received</p>
              <p className="text-amber-700 text-xs mt-0.5">The CHC has sent a final quote with possible additional charges.</p>
            </div>
            <button 
              onClick={() => setShowReviewModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Review Proposal
            </button>
          </div>
        )}
      </div>

      {showReviewModal && (
        <ReviewProposalModal 
          booking={booking} 
          onClose={() => {
            setShowReviewModal(false);
            window.location.reload();
          }} 
        />
      )}
    </>
  );
}
