import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { Tractor, Sprout, IndianRupee, Layers } from "lucide-react";
import { FarmerAnalytics } from "@/components/charts/FarmerAnalytics";

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

  // Fetch all bookings for this farmer
  const bookings = await prisma.booking.findMany({
    where: { farmerId: user.id },
    include: {
      chcService: {
        include: {
          service: true
        }
      }
    }
  });

  // Calculate KPIs
  const activeBookings = bookings.filter(b => ["REQUESTED", "ACCEPTED"].includes(b.bookingStatus)).length;
  const totalArea = bookings.reduce((sum, b) => sum + (b.area || 0), 0);
  const totalSpend = bookings
    .filter(b => b.workStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.vpFinalAmount || (b.chcService.price * b.area)), 0);

  // Process data for charts

  // 1. Service Usage (Pie Chart)
  const serviceUsageMap: Record<string, number> = {};
  bookings.forEach(b => {
    const serviceName = b.chcService.service.name;
    serviceUsageMap[serviceName] = (serviceUsageMap[serviceName] || 0) + 1;
  });
  const serviceUsage = Object.keys(serviceUsageMap).map(key => ({
    name: key,
    value: serviceUsageMap[key]
  }));

  // 2. Monthly Spending (Bar Chart) - Last 6 months
  const monthlySpendingMap: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize last 6 months with 0
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().substring(2)}`;
    monthlySpendingMap[monthStr] = 0;
  }

  bookings
    .filter(b => b.workStatus === "COMPLETED")
    .forEach(b => {
      const d = new Date(b.bookingDate);
      const monthStr = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().substring(2)}`;

      // If the booking occurred within the last 6 months we initialized
      if (monthlySpendingMap[monthStr] !== undefined) {
        const amount = b.vpFinalAmount || (b.chcService.price * b.area);
        monthlySpendingMap[monthStr] += amount;
      }
    });

  const monthlySpending = Object.keys(monthlySpendingMap).map(key => ({
    name: key,
    amount: monthlySpendingMap[key]
  }));

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome back, {user.name.split(" ")[0]}!
        </h2>
        <p className="mt-2 text-lg text-slate-600">
          Here is your farm's analytics and activity overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Bookings</p>
            <p className="text-2xl font-bold text-slate-900">{activeBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Spent</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalSpend.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Area</p>
            <p className="text-2xl font-bold text-slate-900">{totalArea} <span className="text-sm font-medium text-slate-500">Acres</span></p>
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Credit Score</p>
            <p className="text-2xl font-bold text-slate-900">{user.farmerProfile?.creditScore || 0}</p>
          </div>
        </div> */}
      </div>

      <FarmerAnalytics monthlySpending={monthlySpending} serviceUsage={serviceUsage} />
    </div>
  );
}
