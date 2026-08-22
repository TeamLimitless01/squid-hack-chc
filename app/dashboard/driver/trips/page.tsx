import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { redirect } from "next/navigation";
import { Route, CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import TripCard from "@/components/cards/TripCard";

export const metadata = {
  title: "My Trips | Driver Dashboard",
};

export default async function DriverTripsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { driverProfile: true }
  });

  if (!user || user.role !== "driver" || !user.driverProfile) {
    redirect("/");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      assignedDriverId: user.driverProfile.id,
      bookingStatus: "ACCEPTED", // or maybe just not CANCELLED/REJECTED
    },
    include: {
      farmer: true,
      chc: true,
      chcService: {
        include: { service: true }
      },
      assignedResources: {
        include: { equipment: true }
      },
      payment: true
    },
    orderBy: { bookingDate: 'asc' }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const currentlyWorking = bookings.filter(b => 
    !b.workCompleteTime && (b.tripStatus === "STARTED" || b.workStatus === "IN_PROGRESS" || b.workStatus === "COMPLETED")
  );

  const todayTrips = bookings.filter(b => {
    const bDate = new Date(b.bookingDate);
    return bDate >= today && bDate < tomorrow && b.tripStatus !== "STARTED" && b.workStatus !== "IN_PROGRESS" && b.workStatus !== "COMPLETED" && !b.workCompleteTime;
  });

  const upcomingTrips = bookings.filter(b => {
    const bDate = new Date(b.bookingDate);
    return bDate >= tomorrow && b.tripStatus !== "STARTED" && b.workStatus !== "IN_PROGRESS" && b.workStatus !== "COMPLETED" && !b.workCompleteTime;
  });

  const completedTrips = bookings.filter(b => b.workCompleteTime !== null);

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Trips</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your assigned trips and update service statuses.</p>
      </div>

      <div className="space-y-12">
        {/* Currently Working Section */}
        {currentlyWorking.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Route className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Currently Working</h2>
              <span className="ml-2 bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-black animate-pulse">{currentlyWorking.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentlyWorking.map(trip => (
                <TripCard key={trip.id} booking={trip} type="working" />
              ))}
            </div>
          </section>
        )}

        {/* Today's Trips Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Today's Assignments</h2>
            <span className="ml-2 bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-black">{todayTrips.length}</span>
          </div>

          {todayTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500 font-medium">You don't have any trips scheduled for today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {todayTrips.map(trip => (
                <TripCard key={trip.id} booking={trip} type="today" />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Trips Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Trips</h2>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-6 text-center">
              <p className="text-slate-500 font-medium">No upcoming trips assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTrips.map(trip => (
                <TripCard key={trip.id} booking={trip} type="upcoming" />
              ))}
            </div>
          )}
        </section>

        {/* Completed Trips Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 opacity-70">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Previously Completed</h2>
          </div>

          {completedTrips.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-6 text-center opacity-70">
              <p className="text-slate-500 font-medium">No completed trips on record.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
              {completedTrips.map(trip => (
                <TripCard key={trip.id} booking={trip} type="completed" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
