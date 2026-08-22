import Link from "next/link";
import { ArrowRight, Boxes, Cog, Wrench } from "lucide-react";

export default function CHCDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Operations overview</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Keep your center moving.</h2>
          <p className="mt-3 max-w-xl text-slate-500">Manage the equipment and services farmers can book from your Custom Hiring Centre.</p>
        </div>
        <Link href="/dashboard/chc/equipment/add" className="hidden items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 sm:flex"><Wrench className="h-4 w-4" /> Add equipment</Link>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Link href="/dashboard/chc/equipment" className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
          <div className="flex items-center justify-between"><div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><Boxes className="h-6 w-6" /></div><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></div>
          <h3 className="mt-7 text-xl font-bold">Equipment inventory</h3><p className="mt-2 text-sm leading-6 text-slate-500">Add machines, review availability, and grow the resources your center can offer.</p>
        </Link>
        <Link href="/dashboard/chc/add-services" className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
          <div className="flex items-center justify-between"><div className="rounded-xl bg-amber-100 p-3 text-amber-700"><Cog className="h-6 w-6" /></div><ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-600" /></div>
          <h3 className="mt-7 text-xl font-bold">Services</h3><p className="mt-2 text-sm leading-6 text-slate-500">Offer platform services only when your center has the equipment required to deliver them.</p>
        </Link>
      </div>
    </div>
  );
}