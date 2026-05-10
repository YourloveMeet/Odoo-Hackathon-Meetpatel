"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const params = useParams();
  const [email, setEmail] = useState<string | null>(null);

  const tripId = params?.id;

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setEmail(user.email);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Trips", href: "/my-trips" },
    { name: "Community", href: "/community" },
  ];

  const tripLinks = tripId ? [
    { name: "Itinerary", href: `/trip/${tripId}/view` },
    { name: "Budget", href: `/trip/${tripId}/budget` },
    { name: "Journal", href: `/trip/${tripId}/journal` },
    { name: "Checklist", href: `/trip/${tripId}/checklist` },
  ] : [];

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-5xl px-6">
      <nav className="flex items-center justify-between h-16 px-3 bg-[#111111] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex-shrink-0 w-11 h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform duration-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#111111" strokeWidth="2"/>
            <path d="M2.5 12C2.5 12 7 9 12 9C17 9 21.5 12 21.5 12" stroke="#111111" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 17C5 17 8.5 15 12 15C15.5 15 19 17 19 17" stroke="#111111" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Link>

        {/* Links Section */}
        <div className="hidden md:flex items-center gap-8 px-6 overflow-x-auto no-scrollbar">
          {(tripId ? tripLinks : navLinks).map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                pathname === link.href 
                ? "text-white opacity-100" 
                : "text-white/40 hover:text-white hover:opacity-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* User Profile / Email Pill */}
        <Link href="/profile" className="flex-shrink-0">
          <div className="h-11 px-6 bg-white rounded-full flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-sm">
            <span className="text-black text-[12px] font-black uppercase tracking-widest truncate max-w-[150px]">
              {email ? email.split('@')[0] : "Traveloop"}
            </span>
          </div>
        </Link>
      </nav>
    </div>
  );
}

