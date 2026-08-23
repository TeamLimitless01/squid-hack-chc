"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LicenseType } from "@/generated/prisma/client";

const licenseTypes = Object.values(LicenseType);
const licenseLabel = (value: string) => value === "LMV" ? "LMV - Light Motor Vehicle" : value === "HMV" ? "HMV - Heavy Motor Vehicle" : value === "MCWG" ? "MCWG - Motorcycle With Gear" : value === "COMMERCIAL" ? "Commercial" : "Other";
type DriverForm = { name: string; email: string; phone: string; licenseNumber: string; licenseType: string; licenseExpiry: string; experienceYears: string };
const emptyForm: DriverForm = { name: "", email: "", phone: "", licenseNumber: "", licenseType: "", licenseExpiry: "", experienceYears: "" };

export default function UpdateDriverPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        fetch(`/api/chc/drivers/${id}`, { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load driver"); const driver = data.driver; setForm({ name: driver.user.name, email: driver.user.email, phone: driver.user.phone, licenseNumber: driver.licenseNumber, licenseType: driver.licenseType || "", licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : "", experienceYears: String(driver.experienceYears) }); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load driver")).finally(() => setLoading(false));
    }, [id]);

    const update = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [event.target.name]: event.target.value });
    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
        const isPhone = /^(\+\d{1,3}[- ]?)?\d{10}$/.test(form.phone.replace(/\s+/g, ''));

        if (!isEmail) { setError("Please enter a valid email address."); setSaving(false); return; }
        if (!isPhone) { setError("Please enter a valid 10-digit phone number."); setSaving(false); return; }
        if (form.licenseNumber.length < 5) { setError("Please enter a valid license number."); setSaving(false); return; }

        try {
            const response = await fetch(`/api/chc/drivers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to update driver");
            router.refresh();
            router.push("/dashboard/chc/drivers");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unable to update driver");
            setSaving(false);
        }
    };
    const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-emerald-500 focus:bg-white";
    if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-label="Loading driver" /></div>;
    return <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10"><Link href="/dashboard/chc/drivers" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Back to drivers</Link><div className="mt-10"><p className="text-sm font-semibold text-emerald-700">Team operations</p><h2 className="mt-2 text-4xl font-black tracking-tight">Update driver</h2><p className="mt-3 text-slate-500">Keep this driver’s account and credentials current. The phone number is the default password.</p></div>{error && <p className="mt-8 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}<form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="grid gap-6 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Full name *<input name="name" required value={form.name} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Phone *<input name="phone" required value={form.phone} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Email *<input name="email" type="email" required value={form.email} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Default password<input type="text" value={form.phone} disabled className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`} /></label><label className="text-sm font-semibold text-slate-700">License number *<input name="licenseNumber" required value={form.licenseNumber} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">License type *<select name="licenseType" required value={form.licenseType} onChange={update} className={inputClass}><option value="">Select license type</option>{licenseTypes.map((type) => <option key={type} value={type}>{licenseLabel(type)}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">License expiry<input name="licenseExpiry" type="date" value={form.licenseExpiry} onChange={update} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Experience years<input name="experienceYears" type="number" min="0" step="1" value={form.experienceYears} onChange={update} className={inputClass} /></label></div><button disabled={saving} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} {saving ? "Saving changes..." : "Save changes"}</button></form></div>;
}
