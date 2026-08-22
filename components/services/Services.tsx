"use client";

import { motion } from "framer-motion";
import { Sprout, Tractor, Scissors, Settings, Droplets, Map } from "lucide-react";

const services = [
  {
    title: "Cultivation",
    description: "Prepare your soil with top-tier cultivators to ensure the best yield for your crops.",
    icon: Sprout,
  },
  {
    title: "Sowing",
    description: "Precision seed drills and planters for optimal seed placement and germination.",
    icon: Settings, // using settings/gear as a mechanical metaphor, or we could use something else
  },
  {
    title: "Harvesting",
    description: "Modern combine harvesters for quick, efficient, and loss-free crop collection.",
    icon: Scissors,
  },
  {
    title: "Ploughing",
    description: "Heavy-duty ploughs to turn and break up soil, burying crop residues and weeds.",
    icon: Tractor,
  },
  {
    title: "Spraying",
    description: "Boom sprayers and drone services for even distribution of fertilizers and pesticides.",
    icon: Droplets,
  },
  {
    title: "Land Preparation",
    description: "Laser land levelers and rotavators to create the perfect seedbed.",
    icon: Map,
  },
];

export default function Services() {
  return (
    <section className="py-24 bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Our Services
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything Your Farm Needs
          </h3>
          <p className="text-gray-600 text-lg">
            Discover a wide range of agricultural operations provided by verified Custom Hiring Centres in your area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-100 transition-all group"
              >
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors">
                  <Icon className="w-7 h-7 text-brand-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
