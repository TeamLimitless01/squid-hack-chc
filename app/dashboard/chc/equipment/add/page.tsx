"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEquipment() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", type: "", brand: "", model: "", registrationNumber: "", purchaseYear: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try { const response = await fetch("/api/chc/equipment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to create equipment"); router.push("/dashboard/chc/equipment"); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unable to create equipment"); setSaving(false); }
  };
  return <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10"><Link href="/dashboard/chc/equipment" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Back to equipment</Link><div className="mt-10"><p className="text-sm font-semibold text-emerald-700">Inventory setup</p><h2 className="mt-2 text-4xl font-black tracking-tight">Add equipment</h2><p className="mt-3 text-slate-500">Capture the machine details your centre can make available.</p></div><form onSubmit={submit} className="mt-10 space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{error && <p className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}<div className="grid gap-6 sm:grid-cols-2">{[["name","Equipment name","e.g. John Deere 5310"],["type","Equipment type","e.g. tractor"],["brand","Brand","e.g. John Deere"],["model","Model","e.g. 5310"],["registrationNumber","Registration number","e.g. MH12AB1234"],["purchaseYear","Purchase year","e.g. 2023"]].map(([name,label,placeholder]) => <label key={name} className="text-sm font-semibold text-slate-700">{label}{(name === "name" || name === "type") && <span className="text-rose-500"> *</span>}<input name={name} required={name === "name" || name === "type"} type={name === "purchaseYear" ? "number" : "text"} value={form[name as keyof typeof form]} onChange={update} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /></label>)}</div><button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} {saving ? "Saving equipment..." : "Create equipment"}</button></form></div>;
}