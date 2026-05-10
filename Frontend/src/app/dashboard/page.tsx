"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

const REGIONS = [
  { id: 1, name: "Swiss Alps", image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, name: "Kyoto, Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, name: "Santorini", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, name: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop" },
  { id: 5, name: "Iceland", image: "https://images.unsplash.com/photo-1521339225886-490bf735ad04?q=80&w=1000&auto=format&fit=crop" },
];

const PREVIOUS_TRIPS = [
  { id: 1, title: "Grand Canyon Explorer", date: "May 2024", image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, title: "Parisian Summer", date: "July 2023", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, title: "Northern Lights Adventure", date: "Jan 2023", image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?q=80&w=1000&auto=format&fit=crop" },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchTrips = async () => {
      try {
        const response = await fetch(ENDPOINTS.TRIPS.MY_TRIPS, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setTrips(data.trips);
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    let result = trips.filter(trip => 
      trip.name.toLowerCase().includes(search.toLowerCase()) || 
      (trip.description && trip.description.toLowerCase().includes(search.toLowerCase()))
    );

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [trips, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      {/* Glowy Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/40 border-b border-emerald-900/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter italic text-emerald-900">Traveloop</h1>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-emerald-900/40 font-black">
              <a href="#" className="hover:text-emerald-600 transition-colors">Explore</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">My Trips</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
            </nav>
            <Link href="/profile" className="w-10 h-10 rounded-full border border-emerald-900/10 bg-white/50 flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        {/* Banner Section */}
        <section className="relative h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Banner" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent"></div>
          <div className="absolute bottom-12 left-12 space-y-4 max-w-2xl">
            <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest">Featured Journey</span>
            <h2 className="text-6xl font-light tracking-tighter leading-none text-white">The Great <span className="font-semibold italic">Outdoor</span> Escape</h2>
            <p className="text-white/80 text-lg">Discover hidden valleys and crystal-clear lakes in the heart of nature.</p>
          </div>
        </section>

        {/* Controls Section */}
        <section className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search your next destination..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-emerald-900/20 transition-all placeholder:text-emerald-900/40 text-emerald-900 shadow-sm backdrop-blur-md"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-900/20 group-focus-within:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-4 bg-white/60 border border-emerald-900/5 rounded-2xl text-emerald-900/40 font-bold text-[10px] uppercase tracking-widest hover:border-emerald-900/20 hover:text-emerald-900 transition-all whitespace-nowrap shadow-sm backdrop-blur-md">Group by</button>
            <button className="px-6 py-4 bg-white/60 border border-emerald-900/5 rounded-2xl text-emerald-900/40 font-bold text-[10px] uppercase tracking-widest hover:border-emerald-900/20 hover:text-emerald-900 transition-all whitespace-nowrap shadow-sm backdrop-blur-md">Filter</button>
            <button 
              onClick={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')}
              className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 whitespace-nowrap"
            >
              Sort by: {sortBy === 'date' ? 'Latest' : 'Name'}
            </button>
          </div>
        </section>

        {/* Regional Selections */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-900/5 pb-4">
            <h3 className="text-2xl font-light tracking-tight italic text-emerald-900">Top <span className="font-semibold">Regional</span> Selections</h3>
            <a href="#" className="text-emerald-900/20 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-700 transition-colors">View All</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {REGIONS.map((region) => (
              <div key={region.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-3 border border-emerald-900/5 shadow-sm">
                  <img src={region.image} alt={region.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors"></div>
                </div>
                <p className="text-center text-[10px] font-black tracking-[0.2em] uppercase text-emerald-900/30 group-hover:text-emerald-700 transition-colors">{region.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Previous Trips */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-900/5 pb-4">
            <h3 className="text-2xl font-light tracking-tight italic text-emerald-900">Previous <span className="font-semibold">Trips</span></h3>
            <a href="#" className="text-emerald-900/20 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-700 transition-colors">Full History</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="h-96 rounded-[3rem] bg-white/40 animate-pulse border border-emerald-900/5"></div>
              ))
            ) : filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <Link href={`/trip/${trip._id}/itinerary`} key={trip._id}>
                  <div className="relative h-96 rounded-[3rem] overflow-hidden group shadow-xl border border-white/50 cursor-pointer">
                    <img src={trip.coverPhoto || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000"} alt={trip.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute bottom-8 left-8">
                      <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.4em] mb-2">
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <h4 className="text-xl font-light tracking-tight text-white group-hover:text-emerald-200 transition-colors">{trip.name}</h4>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-emerald-900/60 text-5xl font-light italic">No trips found</div>
                <p className="text-emerald-900/40 text-xs font-bold uppercase tracking-widest">Try a different search or plan a new adventure</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <Link href="/create-trip">
        <button className="fixed bottom-10 right-10 z-50 px-8 py-5 rounded-full bg-emerald-900 text-white font-bold tracking-widest uppercase text-[10px] shadow-[0_20px_50px_-15px_rgba(6,78,59,0.3)] hover:bg-emerald-800 hover:scale-105 transition-all flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Trip
        </button>
      </Link>
    </div>
  );
}
