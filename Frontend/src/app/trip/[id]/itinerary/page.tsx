"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

interface City {
  _id: string;
  name: string;
  country: string;
}

interface Stop {
  _id?: string;
  fromCityId: string;
  toCityId: string;
  travelDate: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  transportType: string;
  transportBudget: number;
  stayBudget: number;
  foodBudget: number;
  notes: string;
  hotelName: string;
  hotelAddress: string;
  days: DayPlan[];
}

interface DayPlan {
  _id: string;
  dayNumber: number;
  date: string;
  activities: Activity[];
}

interface Activity {
  _id?: string;
  dayPlanId: string;
  customName: string;
  scheduledTime: string;
  cost: number;
  durationMins: number;
  notes: string;
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);

  // Modals state
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState<number | null>(null);
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);

  // Stop Form Data
  const [stopForm, setStopForm] = useState({
    fromCityId: "",
    toCityId: "",
    travelDate: "",
    arrivalDate: "",
    departureDate: "",
    transportType: "flight",
    transportBudget: 0,
    stayBudget: 0,
    foodBudget: 0,
    notes: "",
    hotelName: "",
    hotelAddress: ""
  });

  // Activity Form Data
  const [activityForm, setActivityForm] = useState({
    customName: "",
    scheduledTime: "",
    cost: 0,
    durationMins: 60,
    notes: ""
  });

  useEffect(() => {
    fetchTripDetails();
    fetchCities();
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
      }
    } catch (error) {
      showNotification("Failed to load trip details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.CITIES.GET_ALL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCities(data.cities);
      }
    } catch (error) {
      console.error("Failed to load cities");
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- STOP LOGIC ---
  const handleOpenStopModal = () => {
    setStopForm({
      fromCityId: "", toCityId: "", travelDate: "", arrivalDate: "", departureDate: "",
      transportType: "flight", transportBudget: 0, stayBudget: 0, foodBudget: 0, notes: "", hotelName: "", hotelAddress: ""
    });
    setIsStopModalOpen(true);
  };

  const handleSaveStop = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    
    const payload = {
      ...stopForm,
      tripId: id,
      orderIndex: stops.length + 1
    };

    try {
      const response = await fetch(ENDPOINTS.STOPS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Stop created successfully!", "success");
        // Add to local state
        setStops([...stops, { ...payload, _id: data.stop?._id, days: [] }]);
        setIsStopModalOpen(false);
      } else {
        showNotification(data.message || "Failed to create stop", "error");
      }
    } catch (error) {
      showNotification("Server error", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- DAY PLAN LOGIC ---
  const handleAddDay = (stopIndex: number) => {
    const newStops = [...stops];
    const newDayId = "temp-day-" + Date.now(); // Mock ID until we have an API
    const newDayNumber = newStops[stopIndex].days.length + 1;
    newStops[stopIndex].days.push({
      _id: newDayId,
      dayNumber: newDayNumber,
      date: newStops[stopIndex].arrivalDate, // simplified
      activities: []
    });
    setStops(newStops);
  };

  // --- ACTIVITY LOGIC ---
  const handleOpenActivityModal = (stopIndex: number, dayId: string) => {
    setCurrentStopIndex(stopIndex);
    setCurrentDayId(dayId);
    setActivityForm({
      customName: "", scheduledTime: "", cost: 0, durationMins: 60, notes: ""
    });
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    const payload = {
      ...activityForm,
      dayPlanId: currentDayId
      // catalogId left out as it might be optional for custom activities
    };

    try {
      const response = await fetch(ENDPOINTS.ACTIVITIES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        showNotification("Activity added!", "success");
        // Update local state
        if (currentStopIndex !== null && currentDayId !== null) {
          const newStops = [...stops];
          const dayIndex = newStops[currentStopIndex].days.findIndex(d => d._id === currentDayId);
          if (dayIndex > -1) {
            newStops[currentStopIndex].days[dayIndex].activities.push({ ...payload, _id: data.activity?._id });
          }
          setStops(newStops);
        }
        setIsActivityModalOpen(false);
      } else {
        showNotification(data.message || "Failed to create activity", "error");
      }
    } catch (error) {
      showNotification("Server error", "error");
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

      <main className="pt-32 px-6 max-w-5xl mx-auto space-y-12">
        <div className="flex items-end justify-between">
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
          <button 
            onClick={handleOpenStopModal}
            className="px-8 py-4 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.5)] flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Stop
          </button>
        </div>

        {/* Stops List */}
        <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-emerald-900/10 before:-z-10 pl-4">
          {stops.map((stop, index) => {
            const fromCity = cities.find(c => c._id === stop.fromCityId)?.name || "Unknown";
            const toCity = cities.find(c => c._id === stop.toCityId)?.name || "Unknown";
            
            return (
            <div key={index} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-1.5 top-10 w-4 h-4 rounded-full bg-emerald-200 border-4 border-[#f7f9f7] shadow-sm"></div>

              <div className="ml-12 bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-emerald-900/5 shadow-xl transition-all space-y-8">
                
                {/* Stop Header */}
                <div className="flex items-start justify-between border-b border-emerald-900/5 pb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/40 mb-2">Stop {index + 1}</p>
                    <h3 className="text-2xl font-light tracking-tight text-emerald-900">{fromCity} <span className="italic text-emerald-900/40 mx-2">to</span> <span className="font-semibold">{toCity}</span></h3>
                    <p className="text-sm font-medium text-emerald-900/60 mt-1">{new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">Transport</p>
                    <p className="text-sm font-bold text-emerald-900 capitalize">{stop.transportType}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 mt-2">Hotel</p>
                    <p className="text-sm font-bold text-emerald-900">{stop.hotelName}</p>
                  </div>
                </div>

                {/* Days inside Stop */}
                <div className="space-y-6">
                  {stop.days.map((day, dIndex) => (
                    <div key={day._id} className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-900/5">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-semibold italic text-emerald-900">Day {day.dayNumber}</h4>
                        <button 
                          onClick={() => handleOpenActivityModal(index, day._id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 hover:text-emerald-700 bg-white px-4 py-2 rounded-full border border-emerald-900/10 shadow-sm"
                        >
                          + Add Activity
                        </button>
                      </div>

                      {/* Activities List */}
                      {day.activities.length > 0 ? (
                        <div className="space-y-4">
                          {day.activities.map((act, aIndex) => (
                            <div key={aIndex} className="flex items-center justify-between bg-white/80 p-4 rounded-xl border border-emerald-900/5 shadow-sm">
                              <div>
                                <p className="font-bold text-emerald-900">{act.customName}</p>
                                <p className="text-[10px] text-emerald-900/60 font-medium uppercase tracking-widest mt-1">{act.scheduledTime} • {act.durationMins} mins</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-900">{act.cost} {trip?.currency}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-emerald-900/30 py-4">No activities planned yet</p>
                      )}
                    </div>
                  ))}

                  <button 
                    onClick={() => handleAddDay(index)}
                    className="w-full py-4 rounded-[2rem] border border-dashed border-emerald-900/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 hover:text-emerald-900 hover:border-emerald-900/40 transition-all"
                  >
                    + Add New Day Plan
                  </button>
                </div>

              </div>
            </div>
            );
          })}

          {stops.length === 0 && (
            <div className="ml-12 py-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-emerald-900/10">
              <p className="text-emerald-900/40 italic font-medium">Your itinerary is empty. Add a stop to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- STOP MODAL --- */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm" onClick={() => setIsStopModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white p-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsStopModalOpen(false)} className="absolute top-8 right-8 text-emerald-900/40 hover:text-emerald-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-3xl font-light italic text-emerald-900 mb-8">Add <span className="font-semibold">New Stop</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">From City</label>
                <select value={stopForm.fromCityId} onChange={e => setStopForm({...stopForm, fromCityId: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none focus:border-emerald-900/30">
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">To City</label>
                <select value={stopForm.toCityId} onChange={e => setStopForm({...stopForm, toCityId: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none focus:border-emerald-900/30">
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Travel Date</label>
                <input type="date" value={stopForm.travelDate} onChange={e => setStopForm({...stopForm, travelDate: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Stay Duration</label>
                <div className="flex gap-2">
                  <input type="date" value={stopForm.arrivalDate} onChange={e => setStopForm({...stopForm, arrivalDate: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-4 text-emerald-900 outline-none" />
                  <input type="date" value={stopForm.departureDate} onChange={e => setStopForm({...stopForm, departureDate: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-4 text-emerald-900 outline-none" />
                </div>
              </div>

              {/* Transport & Hotel */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Transport Type</label>
                <select value={stopForm.transportType} onChange={e => setStopForm({...stopForm, transportType: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none">
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car / Roadtrip</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Hotel Name</label>
                <input type="text" placeholder="e.g. Luxury Resort" value={stopForm.hotelName} onChange={e => setStopForm({...stopForm, hotelName: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
              </div>

              {/* Budgets */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Transport Budget</label>
                <input type="number" value={stopForm.transportBudget} onChange={e => setStopForm({...stopForm, transportBudget: Number(e.target.value)})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Stay Budget</label>
                <input type="number" value={stopForm.stayBudget} onChange={e => setStopForm({...stopForm, stayBudget: Number(e.target.value)})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
              </div>

              <div className="md:col-span-2 mt-6">
                <button onClick={handleSaveStop} disabled={saving} className="w-full py-5 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-800 transition-all shadow-xl disabled:opacity-50">
                  {saving ? "Saving..." : "Create Stop"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTIVITY MODAL --- */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm" onClick={() => setIsActivityModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white p-10">
            <button onClick={() => setIsActivityModalOpen(false)} className="absolute top-8 right-8 text-emerald-900/40 hover:text-emerald-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-3xl font-light italic text-emerald-900 mb-8">Add <span className="font-semibold">Activity</span></h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Activity Name</label>
                <input type="text" placeholder="e.g. Morning Paragliding" value={activityForm.customName} onChange={e => setActivityForm({...activityForm, customName: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Time</label>
                  <input type="time" value={activityForm.scheduledTime} onChange={e => setActivityForm({...activityForm, scheduledTime: e.target.value})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Duration (Mins)</label>
                  <input type="number" value={activityForm.durationMins} onChange={e => setActivityForm({...activityForm, durationMins: Number(e.target.value)})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Cost</label>
                <input type="number" value={activityForm.cost} onChange={e => setActivityForm({...activityForm, cost: Number(e.target.value)})} className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none" />
              </div>
              <div className="pt-4">
                <button onClick={handleSaveActivity} disabled={saving} className="w-full py-5 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-800 transition-all shadow-xl disabled:opacity-50">
                  {saving ? "Saving..." : "Add Activity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
