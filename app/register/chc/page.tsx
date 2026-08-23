"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, ArrowRight, User as UserIcon, Phone, Mail, Lock, Home } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function CHCRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    centerName: "",
    location: { name: "", lat: 0, lon: 0 }
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSearch = (query: string) => {
    setSearchQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "5",
          countrycodes: "in",
        })}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Location search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectLocation = (place: any) => {
    const addr = place.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || "";

    const fullAddress = place.display_name.split(',').slice(0, 2).join(',');

    setFormData(prev => ({
      ...prev,
      address: fullAddress,
      city,
      state,
      location: {
        name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon)
      }
    }));
    setSearchQuery(place.display_name);
    setSuggestions([]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.address) {
      setError("Please select a location from the suggestions.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register/chc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        throw new Error("Registration successful, but auto-login failed. Please log in manually.");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center font-sans">
      <div className="max-w-xl w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/50">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Home className="text-emerald-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            CHC Registration
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Or <Link href="/register/farmer" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">register as a Farmer</Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Section: Business Details */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Business Details</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Center Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <Home className="h-5 w-5" />
                </div>
                <input type="text" name="centerName" required value={formData.centerName} onChange={handleChange} className="text-gray-900 pl-11 block w-full bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200" placeholder="e.g. Green Valley CHC" />
              </div>
            </div>
          </div>

          {/* Section: Personal Details */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Account Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Owner Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="text-gray-900 pl-11 block w-full bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="text-gray-900 pl-11 block w-full bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200" placeholder="+91 9876543210" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="text-gray-900 pl-11 block w-full bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="text-gray-900 pl-11 block w-full bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200" placeholder="••••••••" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-5 relative">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search Area / Village</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  className="text-gray-900 pl-11 block w-full bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white sm:text-sm h-12 transition-all duration-200"
                  placeholder="Type your area, village or city..."
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                  </div>
                )}
              </div>

              {suggestions.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full bg-white/90 backdrop-blur-xl shadow-2xl rounded-xl py-2 text-base ring-1 ring-black/5 overflow-auto max-h-60 focus:outline-none sm:text-sm transform opacity-100 scale-100 transition-all origin-top">
                  {suggestions.map((place, idx) => (
                    <li
                      key={idx}
                      className="text-gray-800 cursor-default select-none relative py-2.5 px-4 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer transition-colors"
                      onClick={() => handleSelectLocation(place)}
                    >
                      <span className="block truncate font-semibold">
                        {place.display_name.split(',')[0]}
                      </span>
                      <span className="block truncate text-xs text-gray-500 mt-0.5">
                        {place.display_name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {formData.address && (
              <div className="mt-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-sm shadow-sm backdrop-blur-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><MapPin className="w-4 h-4 text-emerald-500" /></div>
                  <div>
                    <p className="text-emerald-900 font-semibold mb-0.5">Selected Location</p>
                    <p className="text-emerald-700/90 leading-tight">{formData.address}</p>
                    <p className="text-emerald-700/90 leading-tight">{formData.city && formData.city + ", "}{formData.state}</p>
                    <p className="text-emerald-500 text-[11px] font-medium tracking-wide mt-2">
                      {formData.location.lat.toFixed(5)}, {formData.location.lon.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all items-center shadow-lg hover:shadow-emerald-500/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
