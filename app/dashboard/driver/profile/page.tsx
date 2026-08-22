import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import DriverProfileForm from "./DriverProfileForm";
import { redirect } from "next/navigation";
import { Star, Truck, UserCheck } from "lucide-react";

export const metadata = {
  title: "My Profile | Driver Dashboard",
};

export default async function DriverProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      driverProfile: {
        include: { assignedCHC: true }
      }
    }
  });

  if (!user || user.role !== "driver" || !user.driverProfile) {
    redirect("/");
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          My Profile
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          Manage your personal information and view your professional statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Read Only Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Account Status
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Assigned CHC</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {user.driverProfile.assignedCHC ? user.driverProfile.assignedCHC.centerName : "Independent / Unassigned"}
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Driver Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <p className="text-xl font-bold text-slate-900">{user.driverProfile.rating.toFixed(1)} / 5</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Availability</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                    ${user.driverProfile.availabilityStatus === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.driverProfile.availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {user.driverProfile.availabilityStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 text-white relative overflow-hidden">
            <Truck className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-800 opacity-50" />
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Total Experience</h3>
              <p className="text-4xl font-black text-white">{user.driverProfile.experienceYears} <span className="text-xl text-slate-400">Yrs</span></p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Personal & License Information</h3>
            <DriverProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
