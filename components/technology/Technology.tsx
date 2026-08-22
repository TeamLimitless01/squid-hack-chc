"use client";

import { motion } from "framer-motion";
import { LocateFixed, Cpu, Route, ShieldCheck, Wrench, FileCheck, Smartphone } from "lucide-react";

const techFeatures = [
  { name: "Location-Based Discovery", icon: LocateFixed },
  { name: "Smart Vendor Matching", icon: Cpu },
  { name: "Digital Bookings", icon: FileCheck },
  { name: "Secure Mobile Payments", icon: ShieldCheck },
  { name: "Live Fleet Tracking", icon: Route },
  { name: "Equipment Verification", icon: Wrench },
];

export default function Technology() {
  return (
    <section className="py-20 bg-gray-900 border-t border-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-20" />

        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <Smartphone className="w-10 h-10 text-brand-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Powered by Modern Technology
          </h2>
          <p className="text-gray-400 text-lg">
            We leverage cutting-edge tech to bring transparency, efficiency, and reliability to the Indian agricultural sector.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
          {techFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 group-hover:text-brand-400 text-gray-400 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-white font-medium text-sm md:text-base">
                  {feature.name}
                </h4>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
