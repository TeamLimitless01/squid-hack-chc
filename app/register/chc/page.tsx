"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, ArrowRight, User as UserIcon, Phone, Mail, Lock, Home, FileText } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function CHCRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    centerName: "",
    registrationNumber: "",
    description: "",
    location: { type: "Point", coordinates: [0, 0] }
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationDetect = async () => {
    if (!formData.address && !formData.city) {
      setError("Please enter at least an address or city to detect location.");
      return;
    }
    
    setLocationLoading(true);
    setError("");
    
    try {
      const query = `${formData.address} ${formData.city} ${formData.state}`.trim();
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          location: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] }
        }));
        alert(`Location detected! (Lat: ${lat}, Lng: ${lon})`);
      } else {
        setError("Could not find coordinates for this address.");
      }
    } catch (err) {
      setError("Failed to fetch location from Nominatim.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center flex items-center justify-center gap-3">
            <Home className="text-blue-500 w-8 h-8" />
            CHC Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or <Link href="/register/farmer" className="font-medium text-blue-600 hover:text-blue-500">register as a Farmer</Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-11 border" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-11 border" placeholder="+91 9876543210" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-11 border" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-11 border" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">CHC Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Center Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="centerName" required value={formData.centerName} onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border h-11" placeholder="Green Valley CHC" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Registration Number (Optional)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border h-11" placeholder="REG-12345" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border" placeholder="Tell us about the equipment and services you offer..." />
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Location</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border h-11" placeholder="123 CHC Road" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border h-11" placeholder="Springfield" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border h-11" placeholder="IL" />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleLocationDetect}
                disabled={locationLoading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-500 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors h-11"
              >
                {locationLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <MapPin className="w-5 h-5 mr-2" />}
                {locationLoading ? "Detecting Coordinates..." : "Detect Precise Coordinates"}
              </button>
              {formData.location.coordinates[0] !== 0 && (
                 <p className="text-xs text-blue-600 text-center font-medium">Coordinates saved: {formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all h-12 items-center shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register Profile
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
