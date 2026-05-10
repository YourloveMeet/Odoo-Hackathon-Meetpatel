"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const params = useParams();
  const [user, setUser] = useState<any>(null);

  const tripId = params?.id;

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetch(ENDPOINTS.AUTH.GET_PROFILE, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(err => console.error("Failed to fetch profile in navbar", err));
    }
  }, []);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Trips", href: "/my-trips" },
    { name: "Community", href: "/community" },
  ];

  const tripLinks = tripId ? [
    { name: "Itinerary", href: `/trip/${tripId}/itinerary` },
    { name: "Budget", href: `/trip/${tripId}/budget` },
    { name: "Journal", href: `/trip/${tripId}/journal` },
    { name: "Checklist", href: `/trip/${tripId}/checklist` },
  ] : [];

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanUrl = url.replace(/\\/g, '/');
    return `http://localhost:5000${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-5xl px-6">
      <nav className="flex items-center justify-between h-16 px-6 bg-[#111111] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md">
        {/* Brand Section */}
        <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-white font-black uppercase tracking-[0.3em] text-[13px]">
            Traveloop
          </span>
        </Link>

        {/* Links Section */}
        <div className="hidden md:flex items-center gap-8 px-6 overflow-x-auto no-scrollbar">
          {(tripId ? tripLinks : navLinks).map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                pathname === link.href 
                ? "text-white opacity-100" 
                : "text-white/40 hover:text-white hover:opacity-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* User Profile Section */}
        <Link href="/profile" className="flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-all shadow-sm overflow-hidden border border-white/20">
            {user?.photo ? (
              <img 
                src={getImageUrl(user.photo)} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-emerald-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-black uppercase">
                  {user?.email?.[0] || "T"}
                </span>
              </div>
            )}
          </div>
        </Link>
      </nav>
    </div>
  );
}

