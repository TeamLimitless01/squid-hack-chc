"use client";

import { motion } from "framer-motion";
import { Navigation, IndianRupee, ShieldCheck, Clock, CreditCard, Leaf } from "lucide-react";

const features = [
  {
    title: "Nearby Service Providers",
    description: "Find services instantly around your farm with our smart geo-location matching.",
    icon: Navigation,
  },
  {
    title: "Transparent Pricing",
    description: "See the exact service price and approve any additional charges before work begins.",
    icon: IndianRupee,
  },
  {
    title: "Verified Resources",
    description: "All CHCs provide services using rigorously inspected agricultural equipment.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Updates",
    description: "Track service progress from the moment you request until the job is completed.",
    icon: Clock,
  },
  {
    title: "Secure Payments",
    description: "Integrated online payments ensure your money is safe and transactions are seamless.",
    icon: CreditCard,
  },
  {
    title: "Better Farm Operations",
    description: "Reduce the effort required to arrange work, letting you focus on what matters.",
    icon: Leaf,
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">
              Why Choose Us
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              The smartest way to manage your farm work
            </h3>
          </div>
          <p className="text-gray-600 max-w-md text-lg">
            We bring technology and trust to the fields, making agricultural operations smooth for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-brand-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
