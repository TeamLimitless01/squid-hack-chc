import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import FarmerProfileForm from "./FarmerProfileForm";

export default async function FarmerProfilePage() {
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
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          My Profile
        </h2>
        <p className="mt-2 text-slate-600">
          Manage your personal information and view your account standing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Read Only Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Account Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Credit Score</p>
                <p className="text-2xl font-bold text-emerald-600">{user.farmerProfile?.creditScore || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Credit Limit</p>
                <p className="text-lg font-bold text-slate-900">₹{user.farmerProfile?.creditLimit || 0}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h3>
            
            <FarmerProfileForm user={{
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address || "",
              city: user.city || "",
              state: user.state || "",
              location: user.location as any,
            }} />

          </div>
        </div>
      </div>
    </div>
  );
}
