"use client";

import Link from "next/link";
import { User, LayoutDashboard, Calendar, Home } from "lucide-react";
import SignOutButton from "../chc/sign-out-button";
import { usePathname } from "next/navigation";
import { PusherListener } from "@/components/PusherListener";

export default function FarmerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (section: string) => section === "overview" ? pathname === "/dashboard/farmer" : pathname.startsWith(`/dashboard/farmer/${section}`);

  const desktopLinkClass = (section: string) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive(section) ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"}`;

  const mobileLinkClass = (section: string) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${isActive(section) ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-emerald-50"}`;

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-slate-900">
      <PusherListener />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-7 lg:flex lg:flex-col">
        <div className="mb-10 px-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img src="https://img.pikbest.com/png-images/20241029/an-agriculture-logo-sun-and-crops-icon_11024322.png!sw800" alt="Logo" className="w-6 h-6 object-contain" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">AgriConnect</p>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Farmer Workspace</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard/farmer" className={desktopLinkClass("overview")}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link href="/dashboard/farmer/profile" className={desktopLinkClass("profile")}>
            <User className="h-4 w-4" /> My Profile
          </Link>
          <Link href="/dashboard/farmer/bookings" className={desktopLinkClass("bookings")}>
            <Calendar className="h-4 w-4" /> My Bookings
          </Link>

          <div className="my-2 border-t border-slate-100"></div>

          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-5">
          <SignOutButton />
        </div>
      </aside>

      <main className="min-h-screen lg:pl-72">
        <nav className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard/farmer" className={mobileLinkClass("overview")}>Overview</Link>
          <Link href="/dashboard/farmer/profile" className={mobileLinkClass("profile")}>Profile</Link>
          <Link href="/dashboard/farmer/bookings" className={mobileLinkClass("bookings")}>My Bookings</Link>
        </nav>
        {children}
      </main>
    </div>
  );
}
