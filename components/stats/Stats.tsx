"use client";

import { motion } from "framer-motion";

const stats = [
  { id: 1, name: "Farmers", value: "10K+" },
  { id: 2, name: "Service Providers", value: "500+" },
  { id: 3, name: "Services Completed", value: "25K+" },
  { id: 4, name: "Cities", value: "50+" },
];

export default function Stats() {
  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center text-center space-y-2"
            >
              <dd className="text-4xl font-extrabold text-brand-600 tracking-tight">
                {stat.value}
              </dd>
              <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {stat.name}
              </dt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
