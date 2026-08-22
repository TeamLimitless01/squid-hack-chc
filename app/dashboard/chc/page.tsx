import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import Link from "next/link";
import { ArrowRight, Boxes, CalendarDays, Cog, Wrench, IndianRupee, Tractor, Pickaxe, Clock } from "lucide-react";
import { CHCAnalytics } from "@/components/charts/CHCAnalytics";
import { redirect } from "next/navigation";

export default async function CHCDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { chcProfile: true }
  });

  if (!user || !user.chcProfile) {
    redirect("/"); // Not a CHC
  }

  const chcId = user.chcProfile.id;

  // Fetch data
  const [bookings, equipmentCount, activeServices] = await Promise.all([
    prisma.booking.findMany({
      where: { chcId },
      include: {
        chcService: { include: { service: true } },
        payment: true
      }
    }),
    prisma.equipment.count({ where: { chcId } }),
    prisma.cHCService.count({ where: { chcId, isActive: true } })
  ]);

  // KPIs
  const activeJobs = bookings.filter(b => 
    ["REQUESTED", "ACCEPTED"].includes(b.bookingStatus) || 
    b.workStatus === "IN_PROGRESS" || 
    b.tripStatus === "STARTED" ||
    (b.workStatus === "COMPLETED" && b.payment?.status !== "PAID")
  ).length;
  
  const totalBookings = bookings.length;
  
  // Calculate Revenue (including PAID or cash pending on completed)
  const totalRevenue = bookings
    .filter(b => b.workStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.payment?.amount || b.vpFinalAmount || (b.chcService.price * b.area)), 0);

  // Process data for charts
  
  // 1. Service Popularity (Pie Chart)
  const servicePopularityMap: Record<string, number> = {};
  bookings.forEach(b => {
    const serviceName = b.chcService.service.name;
    servicePopularityMap[serviceName] = (servicePopularityMap[serviceName] || 0) + 1;
  });
  const servicePopularity = Object.keys(servicePopularityMap).map(key => ({
    name: key,
    value: servicePopularityMap[key]
  }));

  // 2. Monthly Revenue (Area Chart) - Last 6 months
  const monthlyRevenueMap: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().substring(2)}`;
    monthlyRevenueMap[monthStr] = 0;
  }

  bookings
    .filter(b => b.workStatus === "COMPLETED")
    .forEach(b => {
      const d = new Date(b.bookingDate);
      const monthStr = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().substring(2)}`;
      
      if (monthlyRevenueMap[monthStr] !== undefined) {
        const amount = b.payment?.amount || b.vpFinalAmount || (b.chcService.price * b.area);
        monthlyRevenueMap[monthStr] += amount;
      }
    });

  const monthlyRevenue = Object.keys(monthlyRevenueMap).map(key => ({
    name: key,
    amount: monthlyRevenueMap[key]
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Operations Overview</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Keep your center moving.</h2>
          <p className="mt-3 max-w-xl text-slate-500">Track revenue, manage bookings, and optimize your Custom Hiring Centre's performance.</p>
        </div>
        <Link href="/dashboard/chc/equipment/add" className="hidden items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 sm:flex shadow-md">
          <Wrench className="h-4 w-4" /> Add equipment
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Jobs</p>
            <p className="text-2xl font-black text-slate-900">{activeJobs}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Bookings</p>
            <p className="text-2xl font-black text-slate-900">{totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Equipment</p>
            <p className="text-2xl font-black text-slate-900">{equipmentCount}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <CHCAnalytics monthlyRevenue={monthlyRevenue} servicePopularity={servicePopularity} />

      {/* Quick Links */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">Quick Management</h3>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/dashboard/chc/bookings" className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl">
          <div className="flex items-center justify-between"><div className="rounded-xl bg-sky-100 p-3 text-sky-700"><CalendarDays className="h-6 w-6" /></div><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-600" /></div>
          <h3 className="mt-7 text-xl font-bold">Bookings Management</h3><p className="mt-2 text-sm leading-6 text-slate-500">Review farmer requests, assign drivers, and follow every booking by its status.</p>
        </Link>
        <Link href="/dashboard/chc/equipment" className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
          <div className="flex items-center justify-between"><div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><Boxes className="h-6 w-6" /></div><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></div>
          <h3 className="mt-7 text-xl font-bold">Equipment Inventory</h3><p className="mt-2 text-sm leading-6 text-slate-500">Add machines, review availability, and grow the resources your center offers.</p>
        </Link>
        <Link href="/dashboard/chc/add-services" className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
          <div className="flex items-center justify-between"><div className="rounded-xl bg-amber-100 p-3 text-amber-700"><Cog className="h-6 w-6" /></div><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-600" /></div>
          <h3 className="mt-7 text-xl font-bold">Services Configuration</h3><p className="mt-2 text-sm leading-6 text-slate-500">Configure prices and offer platform services when you have the equipment ready.</p>
        </Link>
      </div>
    </div>
  );
}