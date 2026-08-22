import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Layers, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "My Bookings | Farmer Dashboard",
};

export default async function FarmerBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const farmer = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!farmer || farmer.role !== "farmer") {
    redirect("/");
  }

  // Fetch all bookings for this farmer
  const bookings = await prisma.booking.findMany({
    where: {
      farmerId: farmer.id,
    },
    include: {
      chcService: {
        include: {
          service: true,
        }
      },
      chc: true,
    },
    orderBy: {
      bookingDate: 'desc',
    }
  });

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
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
        <p className="text-slate-500 mt-2 text-lg">Track and manage your service requests.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No Bookings Yet</h3>
          <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
            You haven't made any service bookings. Search for Custom Hiring Centres near you to get started.
          </p>
          <a href="/chc/services" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95">
            Find Services
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                    ₹{(booking.chcService.price * booking.area).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
