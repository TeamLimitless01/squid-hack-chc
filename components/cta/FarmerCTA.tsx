"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FarmerCTA() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2rem] overflow-hidden bg-brand-900"
      >
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaf-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 20 C70 20 80 40 80 50 C80 70 60 80 50 80 C30 80 20 60 20 50 C20 30 40 20 50 20 Z" fill="currentColor" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#leaf-pattern)" />
          </svg>
        </div>
        
        {/* Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-[100px] opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-700 rounded-full blur-[100px] opacity-40 -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 px-6 py-16 md:py-24 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Your Farm Work. <br className="hidden sm:block" />
              <span className="text-brand-300">Simplified.</span>
            </h2>
            <p className="text-brand-50 text-lg md:text-xl leading-relaxed mb-8">
              Stop searching for machines and operators manually. Find the right agricultural service near you in just a few clicks.
            </p>
            <Link
              href="/services"
              className="inline-flex justify-center items-center gap-2 bg-white text-brand-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all shadow-lg active:scale-95"
            >
              Find a Service
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="hidden md:block relative w-64 h-64">
            <div className="absolute inset-0 bg-brand-800 rounded-full animate-pulse opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600" 
              alt="Farmer looking at mobile phone" 
              className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-full border-4 border-brand-700/50"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
