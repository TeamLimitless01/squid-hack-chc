"use client";

import { useState } from "react";
import { MapPin, Calendar, Layers, Clock, CheckCircle2, XCircle, AlertCircle, FileText, CreditCard, Loader2, Banknote } from "lucide-react";
import ReviewProposalModal from "@/components/modals/ReviewProposalModal";
import { createPaymentOrder, verifyPayment, payInCash } from "@/app/actions/payments";

export default function FarmerBookingCard({ booking }: { booking: any }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingCash, setIsProcessingCash] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessingPayment(true);

    // 1. Load Razorpay script
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessingPayment(false);
      return;
    }

    // 2. Create Payment Order on Backend
    const orderData = await createPaymentOrder(booking.id);
    if (!orderData.success) {
      alert(orderData.error || "Failed to create order");
      setIsProcessingPayment(false);
      return;
    }

    // 3. Initialize Razorpay Checkout
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: "INR",
      name: "AgriConnect-Verified Merchant",
      description: `Payment for ${booking.chcService.service.name}`,
      order_id: orderData.orderId,
      handler: async function (response: any) {
        // 4. Verify Payment on Backend
        const verifyRes = await verifyPayment(
          booking.id,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verifyRes.success) {
          alert("Payment Successful!");
          window.location.reload();
        } else {
          alert("Payment Verification Failed!");
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: booking.farmer?.name || "Farmer",
        email: booking.farmer?.email || "farmer@example.com",
        contact: booking.farmer?.phone || "9999999999"
      },
      theme: {
        color: "#059669"
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.on("payment.failed", function (response: any) {
      alert("Payment Failed: " + response.error.description);
      setIsProcessingPayment(false);
    });

    paymentObject.open();
  };

  const handleCashPayment = async () => {
    if (!confirm("Are you sure you want to pay in cash? The driver will need to verify this.")) return;

    setIsProcessingCash(true);
    const res = await payInCash(booking.id);
    if (res.success) {
      alert("Cash payment requested. Please hand the cash to the driver.");
      window.location.reload();
    } else {
      alert(res.error || "Failed to request cash payment");
      setIsProcessingCash(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (booking.payment?.status === "PAID") {
      return (
        <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" /> Fully Paid & Completed
        </span>
      );
    }

    if (booking.workStatus === "COMPLETED") {
      if (booking.payment?.status === "CASH_PENDING") {
        return (
          <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full border border-amber-200">
            <Banknote className="w-4 h-4" /> Cash Pending
          </span>
        );
      }

      return (
        <span className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full border border-blue-200">
          <CheckCircle2 className="w-4 h-4" /> Work Done - Payment Pending
        </span>
      );
    }

    if (booking.workStatus === "IN_PROGRESS") {
      return (
        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full border border-blue-200">
          <Clock className="w-4 h-4" /> Work in Progress
        </span>
      );
    }

    if (booking.tripStatus === "STARTED") {
      return (
        <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-bold px-3 py-1 rounded-full border border-amber-200">
          <MapPin className="w-4 h-4" /> Driver on the Way
        </span>
      );
    }

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
      <div className={`bg-white rounded-2xl p-6 border ${booking.workStatus === 'COMPLETED' && booking.payment?.status !== 'PAID' ? 'border-blue-300 ring-2 ring-blue-50' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow`}>
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Amount</p>
            <p className="font-black text-emerald-700 text-lg">
              ₹{(booking.vpFinalAmount || (booking.chcService.price * booking.area)).toLocaleString('en-IN')}
            </p>
          </div>

          {booking.assignedDriver && (
            <div className="col-span-2 md:col-span-4 pt-3 border-t border-slate-200/60 mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Assigned Driver</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">{booking.assignedDriver.user.name}</p>
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{booking.assignedDriver.user.phone}</p>
              </div>
            </div>
          )}
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

        {/* Payment CTA for Completed Work */}
        {booking.workStatus === "COMPLETED" && booking.payment?.status !== "PAID" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between mt-4">
            <div>
              <p className="text-blue-900 font-black text-lg">Work Completed</p>
              {booking.payment?.status === "CASH_PENDING" ? (
                <p className="text-blue-700 text-sm mt-1">You chose to pay ₹{(booking.vpFinalAmount || (booking.chcService.price * booking.area)).toLocaleString('en-IN')} in cash. Waiting for driver to confirm receipt.</p>
              ) : (
                <p className="text-blue-700 text-sm mt-1">Please settle your due amount of ₹{(booking.vpFinalAmount || (booking.chcService.price * booking.area)).toLocaleString('en-IN')} to clear the booking.</p>
              )}
            </div>
            {booking.payment?.status !== "CASH_PENDING" && (
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <button
                  onClick={handleCashPayment}
                  disabled={isProcessingPayment || isProcessingCash}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-base font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 active:scale-95 whitespace-nowrap"
                >
                  {isProcessingCash ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><Banknote className="w-5 h-5" /> Pay in Cash</>
                  )}
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment || isProcessingCash}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 active:scale-95 whitespace-nowrap"
                >
                  {isProcessingPayment ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pay Online</>
                  )}
                </button>
              </div>
            )}
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
