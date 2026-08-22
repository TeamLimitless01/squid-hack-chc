"use client";

import { motion } from "framer-motion";
import { Search, MapPin, CheckSquare, Tractor } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a Service",
    description: "Select the agricultural work you need done on your farm, from ploughing to harvesting.",
    icon: Search,
  },
  {
    number: "02",
    title: "Find a Nearby CHC",
    description: "Compare suitable service providers and available machinery near your location.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Confirm the Proposal",
    description: "Review the service price, operator details, and approve before work begins.",
    icon: CheckSquare,
  },
  {
    number: "04",
    title: "Get the Work Done",
    description: "Track the service in real-time and receive updates upon completion.",
    icon: Tractor,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Simple Process
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h3>
          <p className="text-gray-600 text-lg">
            Booking agricultural equipment has never been easier. Follow these simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 bg-white border-4 border-cream-50 shadow-md rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:border-brand-100 group-hover:shadow-lg transition-all">
                    <Icon className="w-8 h-8 text-brand-600" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      {step.number}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed px-2">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
