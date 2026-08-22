"use client";

import { ArrowLeft, CarFront, Loader2, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Driver = { id: string; licenseNumber: string; licenseType: string | null; licenseExpiry: string | null; experienceYears: number; availabilityStatus: string; rating: number; user: { name: string; email: string; phone: string; isActive: boolean } };

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/chc/drivers").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load drivers"); setDrivers(data.drivers); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load drivers")).finally(() => setLoading(false));
    }, []);

    return <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10"><Link href="/dashboard/chc" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Back to overview</Link><div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-emerald-700">Team operations</p><h2 className="mt-2 text-4xl font-black tracking-tight">Drivers</h2><p className="mt-2 text-slate-500">{drivers.length} driver{drivers.length === 1 ? "" : "s"} assigned to your centre.</p></div><Link href="/dashboard/chc/drivers/add" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add driver</Link></div>{error && <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}{loading ? <div className="mt-10 flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-label="Loading drivers" /></div> : <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{drivers.map((driver) => <article key={driver.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><CarFront className="h-5 w-5" /></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{driver.availabilityStatus.replaceAll("_", " ")}</span></div><h3 className="mt-5 text-lg font-bold">{driver.user.name}</h3><p className="mt-1 text-sm text-slate-500">{driver.user.phone} · {driver.user.email}</p><div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm"><p><span className="font-semibold text-slate-500">License:</span> {driver.licenseNumber}</p><p><span className="font-semibold text-slate-500">Experience:</span> {driver.experienceYears} year{driver.experienceYears === 1 ? "" : "s"}</p> </div></article>)}</div>}{!loading && !error && drivers.length === 0 && <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><CarFront className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 text-lg font-bold">No drivers yet</h3><p className="mt-2 text-sm text-slate-500">Add a driver to start assigning work.</p></div>}</div>;
}
