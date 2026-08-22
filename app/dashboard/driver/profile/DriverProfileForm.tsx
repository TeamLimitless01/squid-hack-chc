"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { updateDriverProfile } from "@/app/actions/driver-profile";

export default function DriverProfileForm({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await updateDriverProfile(formData);

    if (result.success) {
      setSuccessMessage(result.message || "Profile updated");
    } else {
      setErrorMessage(result.error || "Failed to update profile");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Full Name</label>
          <input
            name="name"
            defaultValue={user.name}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            placeholder="John Doe"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Email Address (Read Only)</label>
          <input
            value={user.email}
            readOnly
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Phone Number</label>
          <input
            name="phone"
            defaultValue={user.phone}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            placeholder="+91 9876543210"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Experience (Years)</label>
          <input
            name="experienceYears"
            type="number"
            min="0"
            defaultValue={user.driverProfile.experienceYears}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="my-6 border-t border-slate-100 pt-6">
        <h4 className="text-base font-bold text-slate-900 mb-4">License Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">License Number</label>
            <input
              name="licenseNumber"
              defaultValue={user.driverProfile.licenseNumber}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium uppercase"
              placeholder="DL-XXXX-XXXXXXX"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">License Type</label>
            <select
              name="licenseType"
              defaultValue={user.driverProfile.licenseType || "LMV"}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            >
              <option value="LMV">Light Motor Vehicle (LMV)</option>
              <option value="HMV">Heavy Motor Vehicle (HMV)</option>
              <option value="MCWG">Motor Cycle With Gear (MCWG)</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="my-6 border-t border-slate-100 pt-6">
        <h4 className="text-base font-bold text-slate-900 mb-4">Address Details</h4>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Street Address</label>
            <input
              name="address"
              defaultValue={user.address || ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              placeholder="123 Farm Road..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">City</label>
              <input
                name="city"
                defaultValue={user.city || ""}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                placeholder="City Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">State</label>
              <input
                name="state"
                defaultValue={user.state || ""}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                placeholder="State"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
}
