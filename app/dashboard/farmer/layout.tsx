import Link from "next/link";
import { User, LayoutDashboard, Calendar, Sprout, Home } from "lucide-react";
import SignOutButton from "../chc/sign-out-button"; // Reusing the same sign-out button

export default function FarmerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8f3] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-7 lg:flex lg:flex-col">
        <div className="mb-10 px-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Squid Hack</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Farmer Workspace</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard/farmer" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link href="/dashboard/farmer/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
            <User className="h-4 w-4" />
            My Profile
          </Link>
          <Link href="/dashboard/farmer/bookings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
            <Calendar className="h-4 w-4" />
            My Bookings
          </Link>
          
          <div className="my-2 border-t border-slate-100"></div>
          
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
            <Home className="h-4 w-4" /> 
            Back to Home
          </Link>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-5">
          <SignOutButton />
        </div>
      </aside>

      <main className="min-h-screen lg:pl-72">
        <nav className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard/farmer" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50">Overview</Link>
          <Link href="/dashboard/farmer/profile" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50">Profile</Link>
          <Link href="/dashboard/farmer/bookings" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50">My Bookings</Link>
        </nav>
        {children}
      </main>
    </div>
  );
}
