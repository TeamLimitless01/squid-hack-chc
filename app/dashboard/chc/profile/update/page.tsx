"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/map/LocationPicker";

type ProfileForm = { name: string; email: string; phone: string; centerName: string; address: string; city: string; state: string; location: { name: string; lat: number; lon: number } | null };


const emptyForm: ProfileForm = { name: "", email: "", phone: "", centerName: "", address: "", city: "", state: "", location: null };

export default function UpdateCHCProfilePage() {
    const router = useRouter();
    const [form, setForm] = useState<ProfileForm>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/chc/profile")
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Unable to load profile");
                const profile = data.profile;
                setForm({ name: profile.name, email: profile.email, phone: profile.phone, centerName: profile.chcProfile.centerName, address: profile.address || "", city: profile.city || "", state: profile.state || "", location: profile.location || null });
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load profile"))
            .finally(() => setLoading(false));
    }, []);

    const update = (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleLocationSelect = (data: any) => {
        setForm({ 
            ...form, 
            address: data.address, 
            city: data.city, 
            state: data.state, 
            location: data.location 
        });
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
        const isPhone = /^(\+\d{1,3}[- ]?)?\d{10}$/.test(form.phone.replace(/\s+/g, ''));
        
        if (!isEmail) { setError("Please enter a valid email address."); setSaving(false); return; }
        if (!isPhone) { setError("Please enter a valid 10-digit phone number."); setSaving(false); return; }

        try {
            const response = await fetch("/api/chc/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to update profile");
            router.push("/dashboard/chc/profile");
        } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unable to update profile"); setSaving(false); }
    };

    if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-label="Loading profile" /></div>;

    const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-emerald-500 focus:bg-white";
    return <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10"><Link href="/dashboard/chc/profile" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Back to profile</Link><div className="mt-10"><p className="text-sm font-semibold text-emerald-700">Account settings</p><h2 className="mt-2 text-4xl font-black tracking-tight">Update profile</h2><p className="mt-3 text-slate-500">Keep your centre and contact details current.</p></div>{error && <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}<form onSubmit={submit} className="mt-8 space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="grid gap-6 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Centre name *<input name="centerName" required value={form.centerName} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Owner name *<input name="name" required value={form.name} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Email *<input name="email" type="email" required value={form.email} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Phone *<input name="phone" required value={form.phone} onChange={update} className={inputClass} /></label></div><div className="relative"><label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label><LocationPicker initialQuery={form.location?.name || ""} initialLocation={form.location} onLocationSelect={handleLocationSelect} placeholder="Search area or fetch live location..." /></div><button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} {saving ? "Saving changes..." : "Save changes"}</button></form></div>;
}
