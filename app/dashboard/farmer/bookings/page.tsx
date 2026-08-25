import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { redirect } from "next/navigation";
import FarmerBookingCard from "@/components/cards/FarmerBookingCard";
import { Calendar, Route } from "lucide-react";

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
  const rawBookings = await prisma.booking.findMany({
    where: {
      farmerId: farmer.id,
    },
    include: {
      chcService: {
        include: {
          service: true,
        }
      },
      chc: {
        include: {
          user: true
        }
      },
      additionalCharges: true,
      payment: true,
      assignedDriver: {
        include: {
          user: true
        }
      },
      farmer: true
    },
    orderBy: {
      bookingDate: 'desc',
    }
  });

  const { getRouteDistance } = await import('@/src/lib/geo');

  const bookings = await Promise.all(rawBookings.map(async (b) => {
    let distance = null;
    const farmerLoc = b.farmer.location as any;
    const chcLoc = b.chc.user.location as any;

    if (farmerLoc?.lat && chcLoc?.lat) {
      const fLat = farmerLoc.lat;
      const fLon = farmerLoc.lng ?? farmerLoc.lon;
      const cLat = chcLoc.lat;
      const cLon = chcLoc.lng ?? chcLoc.lon;
      if (fLat && fLon && cLat && cLon) {
        distance = await getRouteDistance(fLat, fLon, cLat, cLon);
      }
    }

    return { ...b, distance };
  }));

  const currentBookings = bookings.filter(b =>
    b.tripStatus === 'STARTED' ||
    b.workStatus === 'IN_PROGRESS' ||
    (b.workStatus === 'COMPLETED' && b.payment?.status !== 'PAID')
  );

  const upcomingBookings = bookings.filter(b =>
    (b.bookingStatus === 'REQUESTED' || b.bookingStatus === 'ACCEPTED') &&
    b.tripStatus === 'NOT_STARTED' &&
    b.workStatus === 'NOT_STARTED' &&
    b.payment?.status !== 'PAID'
  );

  const previousBookings = bookings.filter(b =>
    (b.workStatus === 'COMPLETED' && b.payment?.status === 'PAID') ||
    b.bookingStatus === 'REJECTED' ||
    b.bookingStatus === 'CANCELLED'
  );

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
          <a href="/services" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 active:scale-95">
            Find Services
          </a>
        </div>
      ) : (
        <div className="space-y-12">
          {currentBookings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Route className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Current Bookings & Works</h2>
                <span className="ml-2 bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-black animate-pulse">{currentBookings.length}</span>
              </div>

              <div className="grid gap-6">
                {currentBookings.map((booking) => (
                  <FarmerBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}

          {upcomingBookings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Bookings</h2>
              </div>

              <div className="grid gap-6">
                {upcomingBookings.map((booking) => (
                  <FarmerBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}

          {previousBookings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Previous Bookings</h2>
              </div>

              <div className="grid gap-6">
                {previousBookings.map((booking) => (
                  <FarmerBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
