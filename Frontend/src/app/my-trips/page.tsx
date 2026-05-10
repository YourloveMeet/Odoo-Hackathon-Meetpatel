"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

import Navbar from "@/components/Navbar";

interface Trip {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  coverPhoto?: string;
}

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(ENDPOINTS.TRIPS.MY_TRIPS, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();
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

  const sortedTrips = useMemo(() => {
    let result = [...trips];
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [trips, sortBy]);

  const groupedTrips = useMemo(() => {
    const filtered = sortedTrips.filter(trip => 
      trip.name.toLowerCase().includes(search.toLowerCase()) || 
      (trip.description && trip.description.toLowerCase().includes(search.toLowerCase()))
    );

    return {
      ongoing: filtered.filter(t => (t as any).status === 'ongoing'),
      upcoming: filtered.filter(t => (t as any).status === 'upcoming' || !(t as any).status),
      completed: filtered.filter(t => (t as any).status === 'completed').slice(0, 3)
    };
  }, [sortedTrips, search]);

  const renderSection = (title: string, tripsList: Trip[]) => {
    if (tripsList.length === 0) return null;
    return (
      <div className="space-y-8">
        <h3 className="text-3xl font-light tracking-tight text-emerald-900 border-b border-emerald-900/10 pb-4">
          {title} <span className="text-xs font-bold uppercase tracking-widest text-emerald-900/30 ml-4">({tripsList.length})</span>
        </h3>
        <div className="space-y-6">
          {tripsList.map((trip) => (
            <Link href={`/trip/${trip._id}/view`} key={trip._id} className="block group">
              <div className="relative h-64 md:h-48 rounded-[2.5rem] bg-white border border-emerald-900/5 shadow-sm hover:shadow-xl hover:border-emerald-900/20 transition-all duration-500 overflow-hidden flex flex-col md:flex-row">
                {/* Visual Accent */}
                <div className="w-full md:w-64 h-32 md:h-full flex-shrink-0 relative">
                  <img 
                    src={trip.coverPhoto || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000"} 
                    alt={trip.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-emerald-900/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-900/40">
                        {new Date(trip.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {new Date(trip.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <h4 className="text-2xl font-light tracking-tight text-emerald-900 group-hover:text-emerald-700 transition-colors break-words">
                        {trip.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/30 mb-1">Short Overview</p>
                      <p className="text-sm text-emerald-900/60 max-w-md line-clamp-1 italic break-words">
                        {trip.description || "Discover the wonders of this planned journey..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex w-24 border-l border-emerald-900/5 items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 overflow-x-hidden">
      <Navbar />
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
      </div>

      <main className="pt-32 pb-32 px-8 max-w-7xl mx-auto space-y-16">

        
        {/* Wireframe Search & Controls */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative w-full">
              <input 
                type="text" 
                placeholder="Search bar ......" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-white/80 backdrop-blur-md border border-emerald-900/5 rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-emerald-900/20 focus:bg-white transition-all placeholder:text-emerald-900/20 text-emerald-900 shadow-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-900/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none h-14 px-8 bg-white/60 backdrop-blur-md border border-emerald-900/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 hover:text-emerald-900 hover:bg-white hover:border-emerald-900/10 transition-all">
                Group by
              </button>
              <button className="flex-1 md:flex-none h-14 px-8 bg-white/60 backdrop-blur-md border border-emerald-900/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 hover:text-emerald-900 hover:bg-white hover:border-emerald-900/10 transition-all">
                Filter
              </button>
              <button 
                onClick={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')}
                className="flex-1 md:flex-none h-14 px-8 bg-emerald-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10 whitespace-nowrap"
              >
                Sort by: <span className="text-emerald-400 ml-1">{sortBy === 'date' ? 'Latest' : 'Name'}</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-12">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-[2.5rem] bg-white border border-emerald-900/5 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-24">
            {renderSection("Ongoing", groupedTrips.ongoing)}
            {renderSection("Up-coming", groupedTrips.upcoming)}
            {renderSection("Completed", groupedTrips.completed)}
            
            {trips.length === 0 && (
              <div className="py-32 text-center space-y-6">
                <div className="text-8xl opacity-10">🧭</div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-light italic text-emerald-900">No journeys started</h3>
                  <p className="text-emerald-900/30 text-[10px] font-bold uppercase tracking-[0.3em]">Time to plan your next adventure</p>
                </div>
                <Link href="/create-trip" className="inline-block mt-8 px-10 py-4 bg-emerald-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">
                  Create Trip
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link href="/create-trip">
        <button className="fixed bottom-10 right-10 z-50 px-8 py-5 rounded-full bg-emerald-900 text-white font-bold tracking-widest uppercase text-[10px] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Trip
        </button>
      </Link>
    </div>
  );
}

