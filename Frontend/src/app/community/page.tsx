"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

export default function CommunityPage() {
  const [search, setSearch] = useState("");
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(ENDPOINTS.COMMUNITY.FEED, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        const data = await res.json();
        
        // Handling both { feed: [...] } and direct array formats just in case
        if (data.feed) {
          setFeed(data.feed);
        } else if (Array.isArray(data)) {
          setFeed(data);
        } else if (data.success && data.data) {
          setFeed(data.data);
        }
      } catch (error) {
        console.error("Failed to load community feed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const getExtractedActivities = (stops: any[]) => {
    if (!stops || !Array.isArray(stops)) return [];
    const acts: string[] = [];
    stops.forEach(stop => {
      stop.days?.forEach((day: any) => {
        day.activities?.forEach((act: any) => {
          // Some APIs return customName, some return name
          const actName = act.name || act.customName;
          if (actName && !acts.includes(actName)) {
            acts.push(actName);
          }
        });
      });
    });
    return acts.slice(0, 5); // Maximum 5 unique activities for the UI tags
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      {/* Background Ambience */}
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
              <Link href="/community" className="text-emerald-600 transition-colors">Community</Link>
              <Link href="/my-trips" className="hover:text-emerald-600 transition-colors">My Trips</Link>
            </nav>
            <Link href="/profile" className="w-10 h-10 rounded-full border border-emerald-900/10 bg-white/50 flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all shadow-sm overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12">
        {/* Controls Section */}
        <section className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search bar ......" 
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
            <button className="px-6 py-4 bg-white/60 border border-emerald-900/5 rounded-2xl text-emerald-900/40 font-bold text-[10px] uppercase tracking-widest hover:border-emerald-900/20 hover:text-emerald-900 transition-all whitespace-nowrap shadow-sm backdrop-blur-md">Sort by...</button>
          </div>
        </section>

        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-emerald-900">
            Community <span className="italic font-semibold">tab</span>
          </h1>
        </div>

        {/* Feed List */}
        <section className="space-y-16">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
            </div>
          ) : feed.length > 0 ? (
            feed.map((post, index) => {
              const userName = `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim() || 'Traveler';
              const userPhoto = post.user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
              const tripCover = post.trip?.coverPhoto && post.trip.coverPhoto.trim() !== "" 
                                ? post.trip.coverPhoto 
                                : 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800';
              const activities = getExtractedActivities(post.stops);

              return (
                <div key={post.trip?._id || index} className="w-full max-w-3xl mx-auto">
                  
                  {/* Trip Card */}
                  <div className="bg-white/80 border border-emerald-900/5 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-md hover:shadow-2xl transition-all group">
                    
                    {/* Card Header (User Info) */}
                    <div className="p-6 md:px-8 md:py-6 flex items-center gap-4 border-b border-emerald-900/5 bg-white/50">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        <img 
                          src={userPhoto} 
                          alt={userName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-emerald-900 font-bold text-sm md:text-base tracking-wide">{userName}</h3>
                        <p className="text-emerald-900/40 text-[10px] md:text-xs uppercase tracking-widest font-semibold">Shared a trip itinerary</p>
                      </div>
                    </div>

                    {/* Cover Photo */}
                    <div className="h-64 md:h-96 w-full relative overflow-hidden">
                      <img 
                        src={tripCover} 
                        alt={post.trip?.name || 'Trip'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Overlay Title */}
                      <div className="absolute bottom-6 left-8 right-8">
                        <h3 className="text-3xl md:text-4xl font-light text-white tracking-tight">{post.trip?.name || 'Untitled Trip'}</h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 space-y-6">
                      <p className="text-emerald-900/70 text-lg leading-relaxed">
                        {post.trip?.description || 'No description provided.'}
                      </p>
                      
                      {activities.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">Activities Included</h4>
                          <div className="flex flex-wrap gap-2">
                            {activities.map((activity, idx) => (
                              <span key={idx} className="px-4 py-2 bg-emerald-100/50 border border-emerald-900/5 text-emerald-900 text-xs font-bold rounded-full">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-6 flex gap-4 border-t border-emerald-900/5 mt-4">
                        <Link href={`/trip/${post.trip?._id}/view`} className="flex-1">
                          <button className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md">
                            View Itinerary
                          </button>
                        </Link>
                        <button className="px-6 py-4 bg-emerald-100 text-emerald-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-200 transition-all shadow-sm flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <p className="text-emerald-900/40 font-bold uppercase tracking-widest">No trips shared in the community yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
