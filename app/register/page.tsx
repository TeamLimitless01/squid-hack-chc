import Link from "next/link";
import { Tractor, Home } from "lucide-react";

export default function RegisterSelection() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Join Squid Hack</h1>
          <p className="text-lg text-gray-600">Choose how you want to use the platform.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/register/farmer" className="block group">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:border-emerald-500 transition-all duration-300 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors duration-300">
                <Tractor className="w-10 h-10 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I am a Farmer</h2>
              <p className="text-gray-500">Register to find and book equipment for your farm.</p>
            </div>
          </Link>

          <Link href="/register/chc" className="block group">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:border-blue-500 transition-all duration-300 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                <Home className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I run a CHC</h2>
              <p className="text-gray-500">Register your Custom Hiring Center to rent out equipment.</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">Already have an account? <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
