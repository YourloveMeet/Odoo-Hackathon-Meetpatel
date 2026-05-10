"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

interface Trip {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  coverPhoto?: string;
}

interface City {
  _id: string;
  name: string;
  imageUrl?: string;
}

export default function TripView({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadData = async () => {
      try {
        // Fetch Trip
        const tripRes = await fetch(ENDPOINTS.TRIPS.GET_SINGLE(id), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const tripData = await tripRes.json();
        if (tripData.success) setTrip(tripData.trip);

        // Fetch Cities
        const citiesRes = await fetch(ENDPOINTS.CITIES.GET_ALL, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const citiesData = await citiesRes.json();
        if (citiesData.success) setCities(citiesData.cities);

        // Fetch Full Itinerary
        const stopsRes = await fetch(ENDPOINTS.STOPS.GET_BY_TRIP(id), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const stopsData = await stopsRes.json();
        
        if (stopsData.success) {
          const fetchedStops = stopsData.stops;
          
          for (let i = 0; i < fetchedStops.length; i++) {
            const stop = fetchedStops[i];
            const daysRes = await fetch(ENDPOINTS.DAY_PLANS.GET_BY_STOP(stop._id), {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const daysData = await daysRes.json();
            stop.days = daysData.success ? daysData.dayPlans : [];
            
            for (let j = 0; j < stop.days.length; j++) {
              const day = stop.days[j];
              const actsRes = await fetch(ENDPOINTS.ACTIVITIES.GET_BY_DAYPLAN(day._id), {
                headers: { "Authorization": `Bearer ${token}` }
              });
              const actsData = await actsRes.json();
              day.activities = actsData.success ? actsData.activities : [];
            }
          }
          setStops(fetchedStops);
        }
      } catch (error) {
        console.error("Failed to load itinerary", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getCityName = (cityData: any) => {
    if (!cityData) return "Unknown";
    const cityId = typeof cityData === 'object' ? cityData._id : cityData;
    return cities.find(c => c._id === cityId)?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <Link href={`/trip/${id}/journal`} className="px-6 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Trip Journal
            </Link>
            <Link href={`/trip/${id}/checklist`} className="px-6 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Packing Checklist
            </Link>
            <Link href={`/trip/${id}/itinerary`} className="px-6 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.5)]">
              Edit Itinerary
            </Link>
            <Link href="/profile" className="w-10 h-10 rounded-full border border-emerald-900/10 bg-white/50 flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-32 px-6 max-w-4xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-emerald-900">
            Itinerary for <span className="italic text-emerald-700 font-semibold">{trip?.name}</span>
          </h2>
          <p className="text-emerald-900/60 uppercase tracking-[0.3em] text-xs font-bold">
            Total Budget: {trip?.totalBudget} {trip?.currency}
          </p>
        </div>

        {/* Checklist Quick Access Banner */}
        <Link href={`/trip/${id}/checklist`} className="block mb-12 group">
          <div className="relative overflow-hidden bg-white/70 border border-emerald-900/10 rounded-3xl p-6 flex items-center justify-between hover:shadow-xl hover:border-emerald-900/20 transition-all duration-300 backdrop-blur-sm cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/40 mb-1">Don't forget anything</p>
                <h3 className="text-xl font-semibold text-emerald-900">Packing Checklist</h3>
                <p className="text-sm text-emerald-900/50 mt-0.5">Documents · Clothing · Electronics and more</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/40 group-hover:text-emerald-700 transition-colors">Open Checklist</span>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Seamless Timeline */}
        <div className="relative">
          {/* Main vertical line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-emerald-900/10 hidden md:block"></div>

          <div className="space-y-24">
            {stops.map((stop, sIndex) => {
              const destCityName = getCityName(stop.toCityId);
              return (
                <div key={stop._id || sIndex} className="relative">
                  
                  {/* Stop Destination Marker */}
                  <div className="flex items-center gap-6 mb-12 relative z-10 md:-ml-2">
                    <div className="hidden md:flex w-20 h-20 bg-emerald-900 rounded-full items-center justify-center shadow-2xl flex-shrink-0 text-emerald-100 border-4 border-[#f7f9f7]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-emerald-900">{destCityName}</h3>
                      <p className="text-emerald-900/50 uppercase tracking-widest text-[10px] font-bold mt-1">Destination Stop</p>
                    </div>
                  </div>

                  <div className="space-y-16">
                    {stop.days.map((day: any, dIndex: number) => (
                      <div key={day._id || dIndex} className="relative md:pl-28">
                        
                        {/* Day Node */}
                        <div className="absolute left-8 top-0 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 border-4 border-[#f7f9f7] shadow-sm z-10">
                          <div className="w-2 h-2 rounded-full bg-emerald-900"></div>
                        </div>

                        {/* Mobile Day Label */}
                        <h4 className="text-emerald-900/40 uppercase tracking-[0.4em] text-xs font-black mb-6 md:hidden">
                          Day {day.dayNumber}
                        </h4>

                        {/* Activities */}
                        <div className="space-y-6">
                          {/* Desktop Day Label inside the flow */}
                          <div className="hidden md:block mb-6">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-900/5 text-emerald-900/60 font-bold uppercase tracking-[0.2em] text-[10px]">
                              Day {day.dayNumber}
                            </span>
                          </div>

                          {day.activities.length > 0 ? day.activities.map((act: any, aIndex: number) => (
                            <div key={act._id || aIndex} className="bg-white/70 hover:bg-white border border-emerald-900/5 hover:border-emerald-900/20 rounded-3xl p-6 md:p-8 transition-all shadow-xl backdrop-blur-md group relative">
                              
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Left: Info */}
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-3">
                                    <h5 className="text-xl md:text-2xl font-semibold text-emerald-900">{act.customName}</h5>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-emerald-900/60 text-xs font-bold uppercase tracking-widest">
                                    {act.scheduledTime && act.scheduledTime.trim() !== "" && (
                                      <span className="flex items-center gap-1.5 bg-emerald-100/50 text-emerald-900 px-3 py-1 rounded-full border border-emerald-900/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                        {act.scheduledTime}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1.5 opacity-70">
                                      {act.durationMins} mins
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Right: Cost Badge */}
                                <div className="flex items-center gap-2 bg-emerald-900/5 px-6 py-4 rounded-2xl md:min-w-[140px] justify-center border border-emerald-900/10">
                                  <span className="text-2xl font-black text-emerald-900">{act.cost}</span>
                                  <span className="text-[10px] text-emerald-900/40 uppercase tracking-[0.2em] font-bold">{trip?.currency}</span>
                                </div>
                              </div>

                            </div>
                          )) : (
                            <div className="bg-transparent border-2 border-emerald-900/5 border-dashed rounded-3xl p-8 text-center text-emerald-900/30 text-xs font-bold uppercase tracking-[0.2em]">
                              Free Day - Explore at your own pace
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
