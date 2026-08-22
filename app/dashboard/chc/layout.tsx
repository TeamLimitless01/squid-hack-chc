"use client";

import Link from "next/link";
import { CalendarDays, CarFront, Cog, LayoutDashboard, UserRound, Wrench } from "lucide-react";
import SignOutButton from "./sign-out-button";
import { usePathname } from "next/navigation";
import { PusherListener } from "@/components/PusherListener";

export default function CHCDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (section: string) => section === "overview" ? pathname === "/dashboard/chc" : pathname.startsWith(`/dashboard/chc/${section}`);
  const desktopLinkClass = (section: string) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive(section) ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`;
  const mobileLinkClass = (section: string) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${isActive(section) ? "bg-emerald-600 text-white" : "text-slate-600"}`;

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-slate-900">
      <PusherListener />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-7 lg:flex lg:flex-col">
        <div className="mb-10 px-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">AgriConnect</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">CHC workspace</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard/chc" className={desktopLinkClass("overview")}><LayoutDashboard className="h-4 w-4" /> Overview</Link>
          <Link href="/dashboard/chc/equipment" className={desktopLinkClass("equipment")}><Wrench className="h-4 w-4" /> Equipment</Link>
          <Link href="/dashboard/chc/add-services" className={desktopLinkClass("add-services")}><Cog className="h-4 w-4" /> Add services</Link>
          <Link href="/dashboard/chc/bookings" className={desktopLinkClass("bookings")}><CalendarDays className="h-4 w-4" /> Bookings</Link>
          <Link href="/dashboard/chc/drivers" className={desktopLinkClass("drivers")}><CarFront className="h-4 w-4" /> Drivers</Link>
          <Link href="/dashboard/chc/profile" className={desktopLinkClass("profile")}><UserRound className="h-4 w-4" /> Profile</Link>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-5"><SignOutButton /></div>
      </aside>
      <main className="min-h-screen lg:pl-72">
        <nav className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard/chc" className={mobileLinkClass("overview")}>Overview</Link>
          <Link href="/dashboard/chc/equipment" className={mobileLinkClass("equipment")}>Equipment</Link>
          <Link href="/dashboard/chc/add-services" className={mobileLinkClass("add-services")}>Add services</Link>
          <Link href="/dashboard/chc/bookings" className={mobileLinkClass("bookings")}>Bookings</Link>
          <Link href="/dashboard/chc/drivers" className={mobileLinkClass("drivers")}>Drivers</Link>
          <Link href="/dashboard/chc/profile" className={mobileLinkClass("profile")}>Profile</Link>
        </nav>
        {children}
      </main>
    </div>
  );
}