"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";
import Navbar from "@/components/Navbar";

const REGIONS = [
  { id: 1, name: "Swiss Alps", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, name: "Kyoto, Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, name: "Santorini", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, name: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop" },
  { id: 5, name: "Iceland", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1000&auto=format&fit=crop" },
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

    return result.slice(0, 3);
  }, [trips, search, sortBy]);
  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 overflow-x-hidden">
      <Navbar />
      {/* Glowy Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
      </div>

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto space-y-16">

        {/* Banner Section */}
        <section className="relative h-[500px] rounded-[3.5rem] overflow-hidden group shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Banner" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
          <div className="absolute bottom-16 left-16 space-y-4 max-w-2xl">
            <span className="px-5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.2em]">Featured Journey</span>
            <h2 className="text-6xl md:text-7xl font-light tracking-tighter leading-[0.9] text-white">The Great <span className="font-semibold italic">Outdoor</span> Escape</h2>
            <p className="text-white/70 text-xl font-light">Discover hidden valleys and crystal-clear lakes in the heart of nature.</p>
          </div>
        </section>

        {/* Wireframe Search & Controls */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative w-full group">
              <input 
                type="text" 
                placeholder="Search your next destination..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white border border-emerald-900/10 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-emerald-900/30 transition-all placeholder:text-emerald-900/20 text-emerald-900 shadow-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-900/20 group-focus-within:text-emerald-900/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none h-14 px-8 bg-white/60 backdrop-blur-md border border-emerald-900/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 hover:text-emerald-900 hover:bg-white transition-all">
                Group by
              </button>
              <button className="flex-1 md:flex-none h-14 px-8 bg-white/60 backdrop-blur-md border border-emerald-900/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 hover:text-emerald-900 hover:bg-white transition-all">
                Filter
              </button>
              <button 
                onClick={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')}
                className="flex-1 md:flex-none h-14 px-8 bg-emerald-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 whitespace-nowrap"
              >
                Sort by: <span className="text-emerald-400 ml-1">{sortBy === 'date' ? 'Latest' : 'Name'}</span>
              </button>
            </div>
          </div>
        </div>

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
        <section id="previous-trips" className="space-y-6">
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
                <Link href={`/trip/${trip._id}/view`} key={trip._id}>
                  <div className="relative h-96 rounded-[3rem] overflow-hidden group shadow-xl border border-white/50 cursor-pointer">
                    <img src={trip.coverPhoto || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000"} alt={trip.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute bottom-8 left-8">
                      <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.4em] mb-2">
                        {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <h4 className="text-xl font-light tracking-tight text-white group-hover:text-emerald-200 transition-colors break-words">{trip.name}</h4>
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
