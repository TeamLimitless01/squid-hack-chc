import Link from "next/link";
import { Cog, LayoutDashboard, Wrench } from "lucide-react";
import SignOutButton from "./sign-out-button";

export default function CHCDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8f3] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-7 lg:flex lg:flex-col">
        <div className="mb-10 px-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">Squid Hack</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">CHC workspace</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard/chc" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"><LayoutDashboard className="h-4 w-4" /> Overview</Link>
          <Link href="/dashboard/chc/equipment" className="flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"><Wrench className="h-4 w-4" /> Equipment</Link>
          <Link href="/dashboard/chc/add-services" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"><Cog className="h-4 w-4" /> Add services</Link>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-5"><SignOutButton /></div>
      </aside>
      <main className="min-h-screen lg:pl-72">
        <nav className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard/chc" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Overview</Link>
          <Link href="/dashboard/chc/equipment" className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Equipment</Link>
          <Link href="/dashboard/chc/add-services" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Add services</Link>
        </nav>
        {children}
      </main>
    </div>
  );
}