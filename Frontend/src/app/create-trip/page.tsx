"use client";

import { useState } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";
import Navbar from "@/components/Navbar";

const SUGGESTIONS = [
  { id: 1, name: "Mountain Hiking", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000" },
  { id: 2, name: "City Sightseeing", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1000" },
  { id: 3, name: "Beach Relaxation", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000" },
  { id: 4, name: "Local Food Tour", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000" },
  { id: 5, name: "Photography Walk", image: "https://images.unsplash.com/photo-1452784444945-3f422708fe5e?q=80&w=1000" },
  { id: 6, name: "Historical Sites", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1000" },
];

export default function CreateTrip() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalBudget: "",
    tripType: "solo",
    currency: "INR",
    isPublic: true
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("You must be logged in", "error");
      setLoading(false);
      return;
    }

    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value.toString());
      });
      if (coverPhoto) {
        dataToSend.append("coverPhoto", coverPhoto);
      }

      const response = await fetch(ENDPOINTS.TRIPS.CREATE, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: dataToSend
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("Trip created successfully!", "success");
        setTimeout(() => window.location.href = `/trip/${data.trip._id}/itinerary`, 1500);
      } else {
        showNotification(data.message || "Failed to create trip", "error");
      }
    } catch (error) {
      showNotification("Server error, please try again", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden pb-20">
      <Navbar />
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

      <main className="pt-32 px-6 max-w-4xl mx-auto space-y-16">
        {/* Form Section */}
        <section className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-light tracking-tight italic text-emerald-900">Plan a <span className="font-semibold">new trip</span></h1>
            <div className="h-px w-20 bg-emerald-900/20"></div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/40 backdrop-blur-md p-12 rounded-[3rem] border border-emerald-900/5 shadow-xl">
            {/* Cover Photo Upload */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Cover Photo (Optional)</label>
              <div className="relative h-64 w-full rounded-[2rem] overflow-hidden border-2 border-dashed border-emerald-900/10 group hover:border-emerald-900/30 transition-all cursor-pointer bg-white/40">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-emerald-900/20 group-hover:text-emerald-900/40 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Click to upload cover photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={handleImageChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-6 md:col-span-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Trip Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Summer in Tuscany" 
                  className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 placeholder:text-emerald-900/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Select a Place / Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your dream destination..." 
                  className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 placeholder:text-emerald-900/40 h-32 resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Start Date</label>
              <input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">End Date</label>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Total Budget</label>
              <input 
                type="number" 
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleChange}
                placeholder="50000" 
                className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 placeholder:text-emerald-900/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">Trip Type</label>
              <select 
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/20 transition-all text-emerald-900 appearance-none cursor-pointer"
              >
                <option value="solo">Solo</option>
                <option value="friends">Friends</option>
                <option value="family">Family</option>
                <option value="couple">Couple</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-emerald-900/5">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-5 h-5 rounded-md border-emerald-900/20 text-emerald-900 focus:ring-emerald-900"
                />
                <label htmlFor="isPublic" className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/60">Make this trip public</label>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-12 py-5 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-900/20 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </form>
        </section>

        {/* Suggestions Section */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-light tracking-tight italic text-emerald-900">Suggestions for <span className="font-semibold">Places to Visit</span></h3>
            <p className="text-emerald-900/70 text-[10px] font-bold uppercase tracking-[0.2em]">Curated activities for your journey</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {SUGGESTIONS.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-4 border border-emerald-900/5 shadow-lg">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">{item.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
