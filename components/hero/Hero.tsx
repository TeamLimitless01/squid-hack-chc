"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Tractor, Sprout, ShieldCheck, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Hero() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide mb-8"
          >
            <Sprout className="w-4 h-4" />
            <span>Modernizing Indian Agriculture</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              The Smart Way to <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                Farm Together
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
          >
            Connect with top-rated Custom Hiring Centres (CHCs). Rent premium agricultural equipment and book professional services on demand.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center h-[60px] w-full">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              </div>
            ) : role === "farmer" ? (
              <>
                <Link
                  href="/dashboard/farmer"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Go to Farmer Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/services"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:border-brand-600 hover:text-brand-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sprout className="w-5 h-5" />
                  Book Services
                </Link>
              </>
            ) : role === "chc" ? (
              <>
                <Link
                  href="/dashboard/chc"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Go to CHC Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard/chc/equipment"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:border-brand-600 hover:text-brand-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Tractor className="w-5 h-5" />
                  Manage Equipment
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register/farmer"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Get Started as Farmer
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register/chc"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:border-brand-600 hover:text-brand-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Tractor className="w-5 h-5" />
                  Register as CHC
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Verified Equipment
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Transparent Pricing
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Secure Payments
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
