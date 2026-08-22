"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Tractor, Sprout, ShieldCheck, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const BACKGROUND_IMAGES = [
  "https://media.istockphoto.com/id/491151340/photo/tractor-on-the-field.jpg?s=612x612&w=0&k=20&c=GuRHohYsC-iq6grpzkZPTPj55lDX1hIQrGhA2MNLTqI=",
  "https://p2.piqsels.com/preview/778/189/239/farmer-tractor-agriculture-farm.jpg",
  "https://images.unsplash.com/photo-1594771804886-a933bb2d609b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YWdyaWN1bHR1cmUlMjBidXNpbmVzc3xlbnwwfHwwfHx8MA%3D%3D"

];

export default function Hero() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BACKGROUND_IMAGES[currentImageIndex]})` }}
          />
        </AnimatePresence>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold tracking-wide mb-8 backdrop-blur-sm"
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Modernizing Indian Agriculture</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              The Smart Way to <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                Farm Together
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto"
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
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : role === "farmer" ? (
              <>
                <Link
                  href="/dashboard/farmer"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Go to Farmer Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/services"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  Book Services
                </Link>
              </>
            ) : role === "chc" ? (
              <>
                <Link
                  href="/dashboard/chc"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Go to CHC Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard/chc/equipment"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Tractor className="w-5 h-5 text-emerald-400" />
                  Manage Equipment
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register/farmer"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Get Started as Farmer
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register/chc"
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 hover:border-white/30 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Tractor className="w-5 h-5 text-emerald-400" />
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
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-300"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verified Equipment
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Transparent Pricing
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Secure Payments
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
