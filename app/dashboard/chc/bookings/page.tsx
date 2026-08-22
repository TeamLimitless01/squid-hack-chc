"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock3, CalendarDays, Layers, Send, UserRound, Tractor } from "lucide-react";
import { rejectBooking } from "@/app/actions/chc-booking-actions";
import ProposalModal from "@/components/modals/ProposalModal";
import AssignResourcesModal from "@/components/modals/AssignResourcesModal";

type Booking = {
    id: string;
    bookingDate: string;
    area: number;
    bookingStatus: string;
    vpFinalAmount: number | null;
    vpProposedAt: string | null;
    farmer: { name: string; phone: string };
    chcService: { service: { name: string }; pricingUnit: string; price: number };
    assignedDriver: { user: { name: string } } | null
};

const statuses = ["ALL", "REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED"];
const statusLabel = (status: string) => status.toLowerCase().replaceAll("_", " ");

export default function CHCBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [proposalBooking, setProposalBooking] = useState<Booking | null>(null);
    const [assignBooking, setAssignBooking] = useState<Booking | null>(null);

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

    const filteredBookings = useMemo(() =>
        selectedStatus === "ALL" ? bookings : bookings.filter((booking) => booking.bookingStatus === selectedStatus),
        [bookings, selectedStatus]
    );

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
                                        </p>
                                    </div>

                                    <span className={`flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize ${booking.bookingStatus === "ACCEPTED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : booking.bookingStatus === "REJECTED" || booking.bookingStatus === "CANCELLED" ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
                                        {booking.bookingStatus === "ACCEPTED" ? <CheckCircle2 className="h-4 w-4" /> : booking.bookingStatus === "REJECTED" || booking.bookingStatus === "CANCELLED" ? <XCircle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                                        {statusLabel(booking.bookingStatus)}
                                    </span>
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

                                {booking.assignedDriver && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm">
                                        <span className="font-bold text-slate-500">Assigned Driver:</span>
                                        <span className="font-semibold text-slate-900">{booking.assignedDriver.user.name}</span>
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
                </>
            )}
        </div>
    );
}
