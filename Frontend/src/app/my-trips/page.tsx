"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

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
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/40 border-b border-emerald-900/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tighter italic text-emerald-900 hover:text-emerald-700 transition-colors">
            Traveloop
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-emerald-900/40 font-black">
              <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
              <Link href="/my-trips" className="text-emerald-600 transition-colors">My Trips</Link>
            </nav>
            <Link href="/profile" className="w-10 h-10 rounded-full border border-emerald-900/10 bg-white/50 flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-emerald-900">
              Your <span className="italic font-semibold">Journeys</span>
            </h1>
            <p className="text-emerald-900/60 text-lg">Manage, view, and relive your planned adventures.</p>
          </div>
        </div>

        {/* Controls Section */}
        <section className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search your trips..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-emerald-900/20 transition-all placeholder:text-emerald-900/40 text-emerald-900 shadow-sm backdrop-blur-md"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-900/20 group-focus-within:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setSortBy(prev => prev === 'date' ? 'name' : 'date')}
              className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 whitespace-nowrap"
            >
              Sort by: {sortBy === 'date' ? 'Latest' : 'Name'}
            </button>
          </div>
        </section>

        {/* Trips Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1,2,3,4,5,6].map(i => (
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
                      <h4 className="text-xl font-light tracking-tight text-white group-hover:text-emerald-200 transition-colors">{trip.name}</h4>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-emerald-900/60 text-5xl font-light italic">No trips found</div>
                <p className="text-emerald-900/40 text-xs font-bold uppercase tracking-widest">You haven't created any trips yet.</p>
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
