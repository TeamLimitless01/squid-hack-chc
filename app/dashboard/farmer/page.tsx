import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { Tractor, Sprout } from "lucide-react";

export default async function FarmerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return <div>Not authenticated</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { farmerProfile: true }
  });

  if (!user) return <div>User not found</div>;

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome back, {user.name.split(" ")[0]}!
        </h2>
        <p className="mt-2 text-lg text-slate-600">
          Here is what's happening on your farm today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Bookings</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Credit Score</p>
            <p className="text-2xl font-bold text-slate-900">{user.farmerProfile?.creditScore || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
