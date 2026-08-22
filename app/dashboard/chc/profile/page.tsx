"use client";

import { ArrowLeft, CircleUserRound, Loader2, MapPin, Pencil, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  createdAt: string;
  chcProfile: { centerName: string; verificationStatus: string; rating: number };
};

export default function CHCProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/chc/profile")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load profile");
        setProfile(data.profile);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load profile"));
  }, []);

  if (!profile && !error) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-label="Loading profile" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <Link href="/dashboard/chc" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Back to overview</Link>
      {error ? <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p> : profile && <>
        <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-emerald-700">CHC account</p><h2 className="mt-2 text-4xl font-black tracking-tight">{profile.chcProfile.centerName}</h2><p className="mt-3 text-slate-500">Your centre profile and account details.</p></div><Link href="/dashboard/chc/profile/update" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"><Pencil className="h-4 w-4" /> Edit profile</Link></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Verification</p><p className="mt-2 font-bold capitalize">{profile.chcProfile.verificationStatus}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Star className="h-5 w-5 text-amber-500" /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Rating</p><p className="mt-2 font-bold">{profile.chcProfile.rating.toFixed(1)} / 5</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CircleUserRound className="h-5 w-5 text-slate-500" /><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Member since</p><p className="mt-2 font-bold">{new Date(profile.createdAt).toLocaleDateString()}</p></div></div>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h3 className="text-xl font-bold">Contact details</h3><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Owner name</p><p className="mt-2 font-semibold">{profile.name}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</p><p className="mt-2 font-semibold break-all">{profile.email}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</p><p className="mt-2 font-semibold">{profile.phone}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p><p className="mt-2 flex items-start gap-2 font-semibold"> <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> { [profile.address, profile.city, profile.state].filter(Boolean).join(", ") || "Not provided"}</p></div></div></section>
      </>}
    </div>
  );
}
