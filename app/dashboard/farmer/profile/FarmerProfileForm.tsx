"use client";

import { useState, useRef } from "react";
import { updateFarmerProfile } from "@/app/actions/farmer-profile";
import { Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import LocationPicker from "@/components/map/LocationPicker";

type UserProps = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  location?: { name: string; lat: number; lon: number } | null;
};

export default function FarmerProfileForm({ user }: { user: UserProps }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Location search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Keep track of address fields internally so they update instantly on selection
  const [addressData, setAddressData] = useState({
    address: user.address,
    city: user.city,
    state: user.state,
    location: user.location
  });

  const handleLocationSelect = (data: any) => {
    setAddressData({
      address: data.address,
      city: data.city,
      state: data.state,
      location: data.location
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);

    const phone = formData.get("phone") as string;
    if (phone) {
      const isPhone = /^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone.replace(/\s+/g, ''));
      if (!isPhone) {
        setMessage({ type: 'error', text: "Please enter a valid 10-digit phone number." });
        setLoading(false);
        return;
      }
    }

    // Append the complex location object as a string
    if (addressData.location) {
      formData.set("location", JSON.stringify(addressData.location));
    }

    const result = await updateFarmerProfile(formData);
    
    setLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: result.message! });
    } else {
      setMessage({ type: 'error', text: result.error! });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Full Name</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={user.name} 
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Phone Number</label>
          <input 
            type="tel" 
            name="phone" 
            defaultValue={user.phone} 
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Email Address (Read-only)</label>
        <input 
          type="email" 
          defaultValue={user.email} 
          disabled
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
        />
      </div>

      {/* Location Section */}
      <div className="space-y-5 pt-4 border-t border-slate-100 relative">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Location</h3>

        <LocationPicker 
          initialQuery={addressData.location?.name || ""}
          initialLocation={addressData.location}
          onLocationSelect={handleLocationSelect} 
          placeholder="Search to update your farm location..." 
        />

        {addressData.address && (
          <div className="mt-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-sm shadow-sm backdrop-blur-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><MapPin className="w-4 h-4 text-emerald-500" /></div>
              <div>
                <p className="text-emerald-900 font-semibold mb-0.5">Current Saved Location</p>
                <p className="text-emerald-700/90 leading-tight">{addressData.address}</p>
                <p className="text-emerald-700/90 leading-tight">{addressData.city && addressData.city + ", "}{addressData.state}</p>
                {addressData.location && (
                  <p className="text-emerald-500 text-[11px] font-medium tracking-wide mt-2">
                    {addressData.location.lat.toFixed(5)}, {addressData.location.lon.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hidden inputs to actually submit the address components */}
        <input type="hidden" name="address" value={addressData.address || ""} />
        <input type="hidden" name="city" value={addressData.city || ""} />
        <input type="hidden" name="state" value={addressData.state || ""} />
      </div>

      <div className="pt-4">
        <button 
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>
    </form>
  );
}
