"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Tractor, User, LayoutDashboard, Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "AI Assistant", href: "/agriconnectAI" },
    // Only show For CHCs if user is not authenticated
    ...(!session ? [{ name: "For CHCs", href: "/register/chc" }] : []),
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 ${
        isScrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-500 text-white p-2 rounded-xl group-hover:bg-brand-600 transition-colors">
              <Tractor className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              AgriConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-brand-600" : "text-gray-600 hover:text-brand-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {status === "loading" ? (
              <div className="flex items-center justify-center w-24 h-10">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              </div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 hover:shadow-md transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-3 text-base font-medium rounded-lg ${
                      isActive 
                        ? "text-brand-600 bg-brand-50" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-3 px-3">
                {status === "loading" ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                  </div>
                ) : session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="block w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register/farmer"
                      className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
