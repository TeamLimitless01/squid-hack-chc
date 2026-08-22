"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Users, Tractor, CalendarCheck, IndianRupee } from "lucide-react";

export default function ChcSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-3">
              For Custom Hiring Centres
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Have Agricultural Equipment? <br />
              <span className="text-gray-400">Turn It Into Opportunity.</span>
            </h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-lg">
              Manage your entire operation from one platform. List your services, manage resources, receive farmer requests, assign drivers, and track your earnings effortlessly.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Reach more farmers in your district",
                "Automate booking and driver assignments",
                "Secure and timely online payments",
                "Track fleet utilization in real-time"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/register/chc"
              className="inline-flex justify-center items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              Join as a CHC
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Dashboard Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-100 rounded-[3rem] -rotate-3 scale-105 opacity-50 z-0" />
            <div className="relative z-10 bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 md:p-8">
              
              {/* Mockup Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">CHC Dashboard</h4>
                  <p className="text-xs text-gray-500">Overview for this month</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100">
                  <span className="font-bold text-brand-600 text-sm">GV</span>
                </div>
              </div>

              {/* Mockup Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Earnings</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹1,42,500</p>
                  <p className="text-xs text-brand-600 font-medium mt-1">+12% this month</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <CalendarCheck className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Bookings</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">48</p>
                  <p className="text-xs text-brand-600 font-medium mt-1">12 active now</p>
                </div>
              </div>

              {/* Mockup List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <Tractor className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">John Deere 5050D</p>
                      <p className="text-xs text-gray-500">Ploughing • Active</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">₹1,500/hr</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Ramesh Kumar</p>
                      <p className="text-xs text-gray-500">Driver • Assigned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded text-xs font-semibold">
                      On Job
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
