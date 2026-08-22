"use client";

import Link from "next/link";
import { Loader2, Pencil, Plus, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

type Equipment = { id: string; name: string; type: string; brand: string | null; model: string | null; registrationNumber: string | null; status: string };

export default function EquipmentListing() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chc/equipment", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load equipment");
      setEquipment(data.equipment);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-emerald-700">Your inventory</p><h2 className="mt-2 text-4xl font-black tracking-tight">Equipment</h2><p className="mt-2 text-slate-500">{equipment.length} machine{equipment.length === 1 ? "" : "s"} registered at your centre.</p></div><div className="flex gap-3"><Link href="/dashboard/chc/add-services" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700">Add services</Link><Link href="/dashboard/chc/equipment/add" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add more equipment</Link></div></div>
      {error && <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}
      {loading ? <div className="mt-10 flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-label="Loading equipment" /></div> : <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{equipment.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-xl bg-slate-100 p-3 text-slate-700"><Wrench className="h-5 w-5" /></div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{item.status}</span><Link href={`/dashboard/chc/equipment/${item.id}/update`} aria-label={`Edit ${item.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="h-4 w-4" /></Link></div></div><h3 className="mt-5 text-lg font-bold">{item.name}</h3><p className="mt-1 text-sm capitalize text-slate-500">{item.type}{item.brand ? ` · ${item.brand}` : ""}{item.model ? ` ${item.model}` : ""}</p>{item.registrationNumber && <p className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Reg. {item.registrationNumber}</p>}</article>)}</div>}
      {!loading && !error && equipment.length === 0 && <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Wrench className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 text-lg font-bold">No equipment yet</h3><p className="mt-2 text-sm text-slate-500">Add your first machine to unlock matching services.</p></div>}
    </div>
  );
}