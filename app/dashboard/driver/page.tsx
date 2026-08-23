import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { redirect } from "next/navigation";
import { Route, Clock } from "lucide-react";

export const metadata = {
  title: "Driver Dashboard | AgriConnect",
};

export default async function DriverDashboardPage() {
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

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-2 text-lg">Here's your performance overview and upcoming trips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Experience</p>
            <p className="text-2xl font-black text-slate-900">{user.driverProfile.experienceYears} Years</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Status</p>
            <p className="text-2xl font-black text-emerald-600 capitalize">{user.driverProfile.availabilityStatus}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <Route className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">No Active Trips</h3>
        <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">
          You don't have any trips scheduled for today. Check your Trips page for upcoming assignments.
        </p>
        <a href="/dashboard/driver/trips" className="inline-block bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95">
          View All Trips
        </a>
      </div>
    </div>
  );
}
