"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

interface ItinerarySection {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [sections, setSections] = useState<ItinerarySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.TRIPS.GET_SINGLE(id), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTrip(data.trip);
        // Map backend itinerary to form sections (handling date formatting)
        if (data.trip.itinerary && data.trip.itinerary.length > 0) {
          setSections(data.trip.itinerary.map((s: any) => ({
            ...s,
            startDate: s.startDate ? s.startDate.split('T')[0] : "",
            endDate: s.endDate ? s.endDate.split('T')[0] : ""
          })));
        } else {
          // Default initial section
          setSections([{ title: "", description: "", startDate: "", endDate: "", budget: 0 }]);
        }
      }
    } catch (error) {
      showNotification("Failed to load trip details", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddSection = () => {
    setSections([...sections, { title: "", description: "", startDate: "", endDate: "", budget: 0 }]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index: number, field: keyof ItinerarySection, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.TRIPS.UPDATE_ITINERARY(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ itinerary: sections })
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Itinerary saved successfully!", "success");
      } else {
        showNotification(data.message || "Failed to save itinerary", "error");
      }
    } catch (error) {
      showNotification("Server error, please try again", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light overflow-x-hidden pb-32">
      {/* Glowy Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-white/80 border-emerald-500/20 text-emerald-700' : 'bg-white/80 border-red-500/20 text-red-700'
        }`}>
          <div className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest">
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/40 border-b border-emerald-900/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tighter italic text-emerald-900 hover:opacity-70 transition-opacity">Traveloop</Link>
          <Link href="/profile" className="w-10 h-10 rounded-full border border-emerald-900/10 bg-white/50 flex items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="pt-32 px-6 max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/40 hover:text-emerald-900 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-light tracking-tight italic text-emerald-900">Build <span className="font-semibold">Itinerary</span></h1>
          <p className="text-emerald-900/60 font-medium">{trip?.name} • {trip?.description}</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="group relative bg-white/50 backdrop-blur-md p-10 rounded-[3rem] border border-emerald-900/5 shadow-xl hover:shadow-2xl transition-all">
              <button 
                onClick={() => handleRemoveSection(index)}
                className="absolute top-8 right-8 text-emerald-900/20 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Section {index + 1}: Title</label>
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                      placeholder="e.g. Flight to Paris, Hilton Stay, Eiffel Tower Visit" 
                      className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 placeholder:text-emerald-900/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Description / Notes</label>
                    <textarea 
                      value={section.description}
                      onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                      placeholder="Add necessary information about this section..." 
                      className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 placeholder:text-emerald-900/40 h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Date Range (Start to End)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={section.startDate}
                      onChange={(e) => handleSectionChange(index, 'startDate', e.target.value)}
                      className="flex-1 bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900"
                    />
                    <span className="text-emerald-900/20">to</span>
                    <input 
                      type="date" 
                      value={section.endDate}
                      onChange={(e) => handleSectionChange(index, 'endDate', e.target.value)}
                      className="flex-1 bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Budget for this section</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={section.budget}
                      onChange={(e) => handleSectionChange(index, 'budget', Number(e.target.value))}
                      placeholder="0" 
                      className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 placeholder:text-emerald-900/40"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-900/30 uppercase tracking-widest">{trip?.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddSection}
            className="w-full py-8 rounded-[3rem] border-2 border-dashed border-emerald-900/10 flex items-center justify-center gap-3 text-emerald-900/40 hover:text-emerald-900 hover:border-emerald-900/30 transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-emerald-900/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Add another Section</span>
          </button>
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-20 py-6 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-800 transition-all shadow-[0_20px_50px_-15px_rgba(6,78,59,0.5)] disabled:opacity-50 flex items-center gap-4"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : null}
            {saving ? "Saving Changes..." : "Save Itinerary"}
          </button>
        </div>
      </main>
    </div>
  );
}
