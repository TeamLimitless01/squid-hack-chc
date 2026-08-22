import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";
import FarmerBookingCard from "@/components/cards/FarmerBookingCard";

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
      additionalCharges: true,
    },
    orderBy: {
      bookingDate: 'desc',
    }
  });

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
            <FarmerBookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
