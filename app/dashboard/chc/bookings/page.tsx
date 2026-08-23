"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock3, CalendarDays, Layers, Send, UserRound, Tractor } from "lucide-react";
import { rejectBooking } from "@/app/actions/chc-booking-actions";
import ProposalModal from "@/components/modals/ProposalModal";
import AssignResourcesModal from "@/components/modals/AssignResourcesModal";
import MapModal from "@/components/map/MapModal";
import { Navigation, Map, Receipt, ChevronDown, ChevronUp, Printer } from "lucide-react";

type Booking = {
    id: string;
    bookingDate: string;
    area: number;
    bookingStatus: string;
    vpFinalAmount: number | null;
    vpProposedAt: string | null;
    additionalCharges: { id: string; reason: string; amount: number }[];
    farmer: { name: string; phone: string; address?: string; city?: string; state?: string; location?: { lat: number; lng?: number; lon?: number } };
    chcService: { service: { name: string }; pricingUnit: string; price: number };
    assignedDriver: { user: { name: string; phone?: string } } | null;
    tripStatus?: string;
    workStatus?: string;
    createdAt?: string;
    updatedAt: string;
    payment?: { status: string; amount: number; method: string; paidAt: string };
    chc?: { location?: { lat?: number; lng?: number; lon?: number } };
};

const statuses = ["ALL", "REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED"];
const statusLabel = (status: string) => status.toLowerCase().replaceAll("_", " ");
const getBaseAmount = (booking: Booking) => booking.chcService.price * booking.area;
const getAdditionalChargesTotal = (booking: Booking) =>
    booking.additionalCharges.reduce((total, charge) => total + charge.amount, 0);
const getTotalAmount = (booking: Booking) =>
    booking.vpFinalAmount ?? getBaseAmount(booking) + getAdditionalChargesTotal(booking);

const getStatusBadge = (booking: Booking) => {
    if (booking.payment?.status === "PAID") {
        return <span className="flex w-fit items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200"><CheckCircle2 className="w-4 h-4" /> Fully Paid & Completed</span>;
    }
    if (booking.workStatus === "COMPLETED") {
        return <span className="flex w-fit items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200"><CheckCircle2 className="w-4 h-4" /> Work Done - Payment Pending</span>;
    }
    if (booking.workStatus === "IN_PROGRESS") {
        return <span className="flex w-fit items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200"><Tractor className="w-4 h-4" /> Work in Progress</span>;
    }
    if (booking.tripStatus === "STARTED") {
        return <span className="flex w-fit items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200"><Navigation className="w-4 h-4" /> Driver on the Way</span>;
    }
    if (booking.bookingStatus === "ACCEPTED") {
        return <span className="flex w-fit items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200"><CheckCircle2 className="w-4 h-4" /> Accepted</span>;
    }
    if (booking.bookingStatus === "REJECTED" || booking.bookingStatus === "CANCELLED") {
        return <span className="flex w-fit items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200"><XCircle className="w-4 h-4" /> {statusLabel(booking.bookingStatus)}</span>;
    }
    return <span className="flex w-fit items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200"><Clock3 className="w-4 h-4" /> {statusLabel(booking.bookingStatus)}</span>;
};

export default function CHCBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [proposalBooking, setProposalBooking] = useState<Booking | null>(null);
    const [assignBooking, setAssignBooking] = useState<Booking | null>(null);
    const [mapBooking, setMapBooking] = useState<Booking | null>(null);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

    const toggleInvoice = (id: string) => {
        setExpandedInvoiceId(prev => prev === id ? null : id);
    };

    const printInvoice = () => {
        window.print();
    };

    const handleReject = async (bookingId: string) => {
        setProcessingId(bookingId);
        setError("");
        try {
            const res = await rejectBooking(bookingId);
            if (res.success) {
                // Optimistically update the state
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, bookingStatus: "REJECTED" } : b));
            } else {
                setError(res.error || "Failed to reject booking.");
            }
        } catch (err) {
            setError("An error occurred while rejecting the booking.");
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => {
        fetch("/api/chc/bookings")
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Unable to load bookings");
                setBookings(data.bookings);
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load bookings"))
            .finally(() => setLoading(false));
    }, []);

    const filteredBookings = useMemo(() => {
        const list = selectedStatus === "ALL" ? bookings : bookings.filter((booking) => booking.bookingStatus === selectedStatus);
        return [...list].sort((a, b) => {
            const timeA = new Date(a.createdAt || a.bookingDate).getTime();
            const timeB = new Date(b.createdAt || b.bookingDate).getTime();
            return timeB - timeA;
        });
    }, [bookings, selectedStatus]);

    const count = (status: string) => status === "ALL" ? bookings.length : bookings.filter((booking) => booking.bookingStatus === status).length;

    return (
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
            <Link href="/dashboard/chc" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700">
                <ArrowLeft className="h-4 w-4" /> Back to overview
            </Link>
            <div className="mt-10">
                <p className="text-sm font-semibold text-emerald-700">Booking operations</p>
                <h2 className="mt-2 text-4xl font-black tracking-tight">Bookings</h2>
                <p className="mt-2 text-slate-500">Review farmer requests and track each booking by status.</p>
            </div>

            {error && <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}

            {loading ? (
                <div className="mt-10 flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-label="Loading bookings" />
                </div>
            ) : (
                <>
                    <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold capitalize transition ${selectedStatus === status ? "bg-emerald-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-emerald-700"}`}
                            >
                                {statusLabel(status)}
                                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{count(status)}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 space-y-4">
                        {filteredBookings.map((booking) => (
                            <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{booking.chcService.service.name}</h3>
                                        <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                            <span className="text-emerald-600 font-bold">{booking.farmer.name}</span> • {booking.farmer.phone}
                                            {booking.farmer.location && (
                                                <button
                                                    onClick={() => setMapBooking(booking)}
                                                    className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-100"
                                                >
                                                    <Map className="w-3 h-3" /> Map
                                                </button>
                                            )}
                                        </p>
                                    </div>

                                    {getStatusBadge(booking)}
                                </div>

                                {/* Pricing and Details Grid matching Farmer Dashboard */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Needed</p>
                                        <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                            <CalendarDays className="h-4 w-4 text-emerald-600" />
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</p>
                                        <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                            <Layers className="h-4 w-4 text-emerald-600" />
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
                                            ₹{(booking.vpFinalAmount !== null ? booking.vpFinalAmount : (booking.chcService.price * booking.area)).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>

                                {booking.additionalCharges.length > 0 && (
                                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                                        <div className="flex items-center justify-between gap-4 border-b border-amber-100 pb-3">
                                            <p className="text-sm font-bold text-slate-700">Work charges</p>
                                            <p className="text-sm font-bold text-slate-900">₹{getBaseAmount(booking).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="mt-3 text-sm font-bold text-amber-900">Additional charges</p>
                                            <p className="text-sm font-bold text-amber-800">+ ₹{getAdditionalChargesTotal(booking).toLocaleString("en-IN")}</p>
                                        </div>
                                        <div className="mt-3 space-y-2 border-t border-amber-100 pt-3">
                                            {booking.additionalCharges.map((charge) => (
                                                <div key={charge.id} className="flex items-center justify-between gap-4 text-sm">
                                                    <span className="font-medium text-slate-600">{charge.reason}</span>
                                                    <span className="font-bold text-slate-900">₹{charge.amount.toLocaleString("en-IN")}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                                    <span className="text-sm font-bold text-emerald-900">Total amount</span>
                                    <span className="text-lg font-black text-emerald-700">₹{getTotalAmount(booking).toLocaleString("en-IN")}</span>
                                </div>

                                {/* Assigned Driver Info */}
                                {booking.assignedDriver && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-500">Assigned Driver:</span>
                                            <span className="font-semibold text-slate-900">{booking.assignedDriver.user.name}</span>
                                        </div>
                                        {/* Only allow changing driver if the trip hasn't started */}
                                        {booking.tripStatus !== "STARTED" && booking.workStatus !== "IN_PROGRESS" && booking.workStatus !== "COMPLETED" && (
                                            <button
                                                onClick={() => setAssignBooking(booking)}
                                                className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition"
                                            >
                                                Change Driver
                                            </button>
                                        )}
                                    </div>
                                )}

                                {booking.bookingStatus === "REQUESTED" && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                                        {booking.vpProposedAt ? (
                                            <div className="flex-1 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-200">
                                                <Send className="w-4 h-4" /> Proposal Sent to Farmer
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setProposalBooking(booking)}
                                                className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition"
                                            >
                                                Send Proposal
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleReject(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="bg-white text-rose-600 border border-rose-200 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-rose-50 transition disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {processingId === booking.id ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                                            ) : "Reject"}
                                        </button>
                                    </div>
                                )}

                                {booking.bookingStatus === "ACCEPTED" && !booking.assignedDriver && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
                                        <button
                                            onClick={() => setAssignBooking(booking)}
                                            className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-800 transition flex items-center gap-2"
                                        >
                                            <Tractor className="w-4 h-4" /> Assign Resources
                                        </button>
                                    </div>
                                )}

                                {/* Invoice Toggle Button */}
                                {booking.payment?.status === "PAID" && (
                                    <button
                                        onClick={() => toggleInvoice(booking.id)}
                                        className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Receipt className="w-5 h-5 text-emerald-600" />
                                        {expandedInvoiceId === booking.id ? "Hide Invoice Details" : "See Invoice Details"}
                                        {expandedInvoiceId === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                )}

                                {/* Detailed Invoice View (Expandable) */}
                                {expandedInvoiceId === booking.id && booking.payment?.status === "PAID" && (
                                    <div className="mt-6 border-t border-dashed border-slate-300 pt-6 animate-in slide-in-from-top-4 duration-300">
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
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Provider (You)</p>
                                                    <p className="font-bold text-slate-800">Your CHC Center</p>
                                                    {booking.assignedDriver && (
                                                        <p className="text-slate-600 text-sm mt-1">Driver: {booking.assignedDriver.user.name} {booking.assignedDriver.user.phone ? `(${booking.assignedDriver.user.phone})` : ''}</p>
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
                                                                Total Received
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
                            </article>
                        ))}
                    </div>

                    {filteredBookings.length === 0 && (
                        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                            <h3 className="mt-4 text-lg font-bold">No {selectedStatus === "ALL" ? "bookings" : statusLabel(selectedStatus) + " bookings"}</h3>
                            <p className="mt-2 text-sm text-slate-500">Bookings matching this status will appear here.</p>
                        </div>
                    )}

                    {proposalBooking && (
                        <ProposalModal booking={proposalBooking} onClose={() => {
                            setProposalBooking(null);
                            window.location.reload();
                        }} />
                    )}

                    {assignBooking && (
                        <AssignResourcesModal booking={assignBooking} onClose={() => {
                            setAssignBooking(null);
                            window.location.reload();
                        }} />
                    )}

                    {mapBooking && mapBooking.farmer.location && (
                        <MapModal
                            lat={mapBooking.farmer.location.lat}
                            lon={mapBooking.farmer.location.lng ?? mapBooking.farmer.location.lon ?? 0}
                            name={mapBooking.farmer.name}
                            farmerLat={mapBooking.chc?.location?.lat} // Optional: we don't fetch CHC location here as it's the CHC itself, we can skip or pass undefined
                            farmerLon={mapBooking.chc?.location?.lng || mapBooking.chc?.location?.lon}
                            onClose={() => setMapBooking(null)}
                        />
                    )}
                </>
            )}
        </div>
    );
}
