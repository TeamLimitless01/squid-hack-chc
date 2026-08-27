"use client";

import { useState } from "react";
import { MapPin, Calendar, Layers, Clock, CheckCircle2, XCircle, AlertCircle, FileText, CreditCard, Loader2, Banknote, Receipt, Printer, ChevronDown, ChevronUp, Map, Phone } from "lucide-react";
import ReviewProposalModal from "@/components/modals/ReviewProposalModal";
import { createPaymentOrder, verifyPayment, payInCash } from "@/app/actions/payments";
import MapModal from "@/components/map/MapModal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function FarmerBookingCard({ booking }: { booking: any }) {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingCash, setIsProcessingCash] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const printInvoice = () => {
    window.print();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
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
      toast.error("Razorpay SDK failed to load. Are you online?");
      setIsProcessingPayment(false);
      return;
    }

    // 2. Create Payment Order on Backend
    const orderData = await createPaymentOrder(booking.id);
    if (!orderData.success) {
      toast.error(orderData.error || "Failed to create order");
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
        setIsVerifying(true);
        // 4. Verify Payment on Backend
        const verifyRes = await verifyPayment(
          booking.id,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verifyRes.success) {
          toast.success("Payment Successful!");
          router.refresh();
        } else {
          toast.error("Payment Verification Failed!");
        }
        setIsVerifying(false);
        setIsProcessingPayment(false);
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
      toast.error("Payment Failed: " + response.error.description);
      setIsProcessingPayment(false);
    });

    paymentObject.open();
  };

  const handleCashPayment = async () => {
    if (!window.confirm("Are you sure you want to pay in cash? The driver will need to verify this.")) return;

    setIsProcessingCash(true);
    const res = await payInCash(booking.id);
    if (res.success) {
      toast.success("Cash payment requested. Please hand the cash to the driver.");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to request cash payment");
    }
    setIsProcessingCash(false);
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
            <p className="text-slate-500 font-medium flex items-center flex-wrap gap-2 mt-1">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-600" /> {booking.chc.centerName}</span>
              {booking.distance != null && (
                <span className="text-slate-400 text-sm">• {booking.distance.toFixed(1)} km away</span>
              )}
              {booking.chc.user?.phone && (
                <a
                  href={`tel:${booking.chc.user.phone}`}
                  className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition flex items-center gap-1 border border-blue-100"
                >
                  <Phone className="w-3 h-3" /> Call Center
                </a>
              )}
              {booking.chc.user?.location && (
                <button
                  onClick={() => setShowMap(true)}
                  className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-100"
                >
                  <Map className="w-3 h-3" /> Map
                </button>
              )}
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
              {new Date(booking.bookingDate).toLocaleDateString('en-GB')}
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Work Charges</p>
            <p className="font-semibold text-slate-900 text-lg">
              ₹{(booking.chcService.price * booking.area).toLocaleString('en-IN')}
            </p>
          </div>

          {booking.additionalCharges && booking.additionalCharges.length > 0 && (
            <div className="col-span-2 md:col-span-4 pt-3 border-t border-slate-200/60 mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Additional Charges</p>
              <div className="space-y-1">
                {booking.additionalCharges.map((charge: any) => (
                  <div key={charge.id} className="flex items-center justify-between">
                    <p className="font-medium text-slate-700 text-sm">{charge.reason}</p>
                    <p className="text-sm font-bold text-slate-800">+₹{charge.amount.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2 md:col-span-4 pt-3 border-t border-slate-200/60 mt-1 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              {(booking.workStatus === "COMPLETED" || booking.payment?.status === "PAID") ? "Total Final Amount" : "Total Estimated Amount"}
            </p>
            <p className="font-black text-emerald-700 text-xl">
              ₹{(booking.vpFinalAmount || (booking.chcService.price * booking.area + (booking.additionalCharges?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0))).toLocaleString('en-IN')}
            </p>
          </div>

          {booking.assignedDriver && (
            <div className="col-span-2 md:col-span-4 pt-3 border-t border-slate-200/60 mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Assigned Driver</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">{booking.assignedDriver.user.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{booking.assignedDriver.user.phone}</p>
                  {(booking.tripStatus === "STARTED" || booking.workStatus === "IN_PROGRESS") && booking.assignedDriver.user.phone && (
                    <a
                      href={`tel:${booking.assignedDriver.user.phone}`}
                      className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Driver
                    </a>
                  )}
                </div>
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
                  disabled={isProcessingPayment || isProcessingCash || isVerifying}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 active:scale-95 whitespace-nowrap"
                >
                  {isVerifying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                  ) : isProcessingPayment ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Pay Online</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Invoice Toggle Button */}
        {booking.payment?.status === "PAID" && (
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Receipt className="w-5 h-5 text-emerald-600" />
            {showInvoice ? "Hide Invoice Details" : "See Invoice Details"}
            {showInvoice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {/* Detailed Invoice View (Expandable) */}
        {showInvoice && booking.payment?.status === "PAID" && (
          <div className="mt-6 border-t border-dashed border-slate-300 pt-6 animate-in slide-in-from-top-4 duration-300">
            {/* The class 'print:block' and specific print styles would typically be added to a global css or a wrapping div that hides everything else during print. For simplicity, we assume this card is the main focus or users can just print the page. */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200" id={`invoice-${booking.id}`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Invoice</h4>
                  <p className="text-slate-500 font-medium mt-1">Receipt for #{booking.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <button
                  onClick={printInvoice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors print:hidden shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Download PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To (Farmer)</p>
                  <p className="font-bold text-slate-800">{booking.farmer?.name}</p>
                  <p className="text-slate-600 text-sm mt-1">{booking.farmer?.address || "Address not provided"}</p>
                  {booking.farmer?.city && <p className="text-slate-600 text-sm">{booking.farmer.city}, {booking.farmer.state}</p>}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Provider</p>
                  <p className="font-bold text-slate-800">{booking.chc.centerName}</p>
                  {booking.assignedDriver && (
                    <p className="text-slate-600 text-sm mt-1">Driver: {booking.assignedDriver.user.name}</p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{booking.chcService.service.name}</p>
                        <p className="text-sm text-slate-500 mt-1">Base Rate: ₹{booking.chcService.price} x {booking.area} {booking.chcService.pricingUnit.toLowerCase()}s</p>
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-slate-900">
                        ₹{(booking.chcService.price * booking.area).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {booking.additionalCharges?.map((charge: any) => (
                      <tr key={charge.id} className="border-b border-slate-100">
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-700">{charge.reason}</p>
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-slate-900">
                          ₹{charge.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-50">
                      <td className="py-4 px-4 font-black text-emerald-900 text-right uppercase text-sm tracking-wider">
                        Total Paid
                      </td>
                      <td className="py-4 px-4 text-right font-black text-emerald-700 text-xl">
                        ₹{(booking.payment?.amount || booking.vpFinalAmount || (booking.chcService.price * booking.area)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 text-center text-slate-400 text-xs font-medium">
                <p>Payment Method: {booking.payment?.method || 'Online'} • Paid on {new Date(booking.payment?.paidAt || booking.updatedAt).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showReviewModal && (
        <ReviewProposalModal
          booking={booking}
          onClose={() => {
            setShowReviewModal(false);
            router.refresh();
          }}
        />
      )}

      {showMap && booking.chc.user?.location && (
        <MapModal
          lat={booking.chc.user.location.lat}
          lon={booking.chc.user.location.lng ?? booking.chc.user.location.lon ?? 0}
          name={booking.chc.centerName}
          farmerLat={booking.farmer?.location?.lat}
          farmerLon={booking.farmer?.location?.lng ?? booking.farmer?.location?.lon}
          bookingId={booking.id}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}
