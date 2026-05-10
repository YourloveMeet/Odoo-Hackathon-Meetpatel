"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

interface City {
  _id: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  description: string;
  famousFor: string[];
  costIndex: string;
}

interface CatalogActivity {
  _id: string;
  name: string;
  type: string;
  cost: number;
  durationMins: number;
  description: string;
  imageUrl: string;
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
  catalogId?: string;
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [activitiesCatalog, setActivitiesCatalog] = useState<CatalogActivity[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);

  // Base Modals state
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  // Search Modals state
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [citySearchTarget, setCitySearchTarget] = useState<'from' | 'to' | null>(null);
  const [isCatalogSearchOpen, setIsCatalogSearchOpen] = useState(false);
  
  // DRAG AND DROP STATE
  const [dragItem, setDragItem] = useState<{type: 'stop' | 'day' | 'activity', stopIndex: number, dayIndex?: number, activityIndex?: number} | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{type: 'stop' | 'day' | 'activity', stopIndex: number, dayIndex?: number, activityIndex?: number} | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentStopIndex, setCurrentStopIndex] = useState<number | null>(null);
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

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
    notes: "",
    catalogId: ""
  });

  useEffect(() => {
    fetchTripDetails();
    fetchCities();
    fetchCatalog();
    loadFullItinerary();
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

  const handleTogglePrivacy = async () => {
    if (!trip) return;
    const newStatus = !trip.isPublic;
    
    // Optimistic update
    setTrip({ ...trip, isPublic: newStatus });
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(ENDPOINTS.TRIPS.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic: newStatus })
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setTrip({ ...trip, isPublic: !newStatus });
        showNotification("Failed to update privacy settings", "error");
      } else {
        showNotification(`Trip is now ${newStatus ? 'Public' : 'Private'}`, "success");
      }
    } catch (error) {
      setTrip({ ...trip, isPublic: !newStatus });
      showNotification("Server error", "error");
    }
  };

  const loadFullItinerary = async () => {
    const token = localStorage.getItem("token");
    try {
      // 1. Fetch Stops
      const stopsRes = await fetch(ENDPOINTS.STOPS.GET_BY_TRIP(id), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const stopsData = await stopsRes.json();
      
      if (!stopsData.success) return;
      
      let fetchedStops = stopsData.stops.map((s: any) => ({
        ...s,
        fromCityId: s.fromCityId?._id || s.fromCityId,
        toCityId: s.toCityId?._id || s.toCityId,
        days: []
      }));

      // 2. Try to fetch Day Plans and Activities
      for (let i = 0; i < fetchedStops.length; i++) {
        const stopId = fetchedStops[i]._id;
        try {
          const daysRes = await fetch(ENDPOINTS.DAY_PLANS.GET_BY_STOP(stopId), {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const daysData = await daysRes.json();
          if (daysData.success) {
            fetchedStops[i].days = daysData.dayPlans.map((dp: any) => ({ ...dp, activities: [] }));
            
            for (let j = 0; j < fetchedStops[i].days.length; j++) {
               const dayId = fetchedStops[i].days[j]._id;
               const actRes = await fetch(ENDPOINTS.ACTIVITIES.GET_BY_DAYPLAN(dayId), {
                 headers: { "Authorization": `Bearer ${token}` }
               });
               const actData = await actRes.json();
               if (actData.success) {
                 fetchedStops[i].days[j].activities = actData.activities;
               }
            }
          }
        } catch (e) {
          console.error("Error fetching days/activities", e);
        }
      }

      setStops(fetchedStops);
    } catch (error) {
      console.error("Failed to load stops", error);
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

  const fetchCatalog = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.ACTIVITIES.CATALOG, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setActivitiesCatalog(data.activities);
      }
    } catch (error) {
      console.error("Failed to load activity catalog");
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- STOP LOGIC ---
  const handleOpenStopModal = (stop?: any) => {
    if (stop) {
      setEditingStopId(stop._id);
      setStopForm({
        fromCityId: stop.fromCityId,
        toCityId: stop.toCityId,
        travelDate: stop.travelDate ? new Date(stop.travelDate).toISOString().split('T')[0] : "",
        arrivalDate: stop.arrivalDate ? new Date(stop.arrivalDate).toISOString().split('T')[0] : "",
        departureDate: stop.departureDate ? new Date(stop.departureDate).toISOString().split('T')[0] : "",
        transportType: stop.transportType || "flight",
        transportBudget: stop.transportBudget || 0,
        stayBudget: stop.stayBudget || 0,
        foodBudget: stop.foodBudget || 0,
        notes: stop.notes || "",
        hotelName: stop.hotelName || "",
        hotelAddress: stop.hotelAddress || ""
      });
    } else {
      setEditingStopId(null);
      setStopForm({
        fromCityId: "", toCityId: "", travelDate: "", arrivalDate: "", departureDate: "",
        transportType: "flight", transportBudget: 0, stayBudget: 0, foodBudget: 0, notes: "", hotelName: "", hotelAddress: ""
      });
    }
    setCitySearchTarget(null);
    setIsStopModalOpen(true);
  };

  const handleSaveStop = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    
    const payload = {
      ...stopForm,
      tripId: id,
      orderIndex: editingStopId ? stops.find(s => s._id === editingStopId)?.orderIndex || stops.length + 1 : stops.length + 1
    };

    try {
      const isEditing = !!editingStopId;
      const url = isEditing ? ENDPOINTS.STOPS.UPDATE(editingStopId) : ENDPOINTS.STOPS.CREATE;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        showNotification(`Stop ${isEditing ? 'updated' : 'saved'} successfully!`, "success");
        if (isEditing) {
          const newStops = stops.map(s => {
             if (s._id === editingStopId) {
               return { ...s, ...stopForm, fromCityId: stopForm.fromCityId, toCityId: stopForm.toCityId };
             }
             return s;
          });
          setStops(newStops);
        } else {
          setStops([...stops, { ...payload, _id: data.stop?._id, days: [] }]);
        }
        setIsStopModalOpen(false);
      } else {
        showNotification(data.message || "Failed to save stop", "error");
      }
    } catch (error) {
      showNotification("Server error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStop = async (stopId: string, index: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.STOPS.DELETE(stopId), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const newStops = [...stops];
        newStops.splice(index, 1);
        
        // Re-number remaining stops
        newStops.forEach((stop, idx) => { 
           const newOrderIndex = idx + 1;
           if (stop.orderIndex !== newOrderIndex) {
             stop.orderIndex = newOrderIndex;
             if (stop._id) updateStopAPI(stop._id, stop.orderIndex);
           }
        });
        setStops(newStops);
        showNotification("Stop deleted", "success");
      } else {
        showNotification(data.message || "Failed to delete stop", "error");
      }
    } catch (err) {
      showNotification("Server error", "error");
    }
  };

  // --- DAY PLAN LOGIC ---
  const handleAddDay = async (stopIndex: number) => {
    const token = localStorage.getItem("token");
    const newStops = [...stops];
    const targetStop = newStops[stopIndex];
    const newDayNumber = targetStop.days.length + 1;
    
    // Create day date based on arrivalDate + dayNumber
    const dayDate = new Date(targetStop.arrivalDate);
    dayDate.setDate(dayDate.getDate() + (newDayNumber - 1));
    
    const payload = {
      stopId: targetStop._id,
      dayNumber: newDayNumber,
      date: dayDate.toISOString()
    };

    try {
      const response = await fetch(ENDPOINTS.DAY_PLANS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        newStops[stopIndex].days.push({
          ...payload,
          _id: data.dayPlan._id,
          activities: []
        });
        setStops(newStops);
        showNotification("Day plan added successfully", "success");
      } else {
        showNotification(data.message || "Failed to add day plan", "error");
      }
    } catch (error) {
      showNotification("Server error while adding day", "error");
    }
  };

  // --- ACTIVITY LOGIC ---
  const handleOpenActivityModal = (stopIndex: number, dayId: string) => {
    setCurrentStopIndex(stopIndex);
    setCurrentDayId(dayId);
    setActivityForm({ customName: "", cost: 0, durationMins: 0, notes: "", catalogId: "", scheduledTime: "09:00" });
    setIsCatalogSearchOpen(false);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    const payload = { ...activityForm, dayPlanId: currentDayId as string };

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

  // --- DRAG AND DROP LOGIC ---
  const handleDragStart = (e: React.DragEvent, type: 'stop' | 'day' | 'activity', stopIndex: number, dayIndex?: number, activityIndex?: number) => {
    e.stopPropagation();
    setDragItem({ type, stopIndex, dayIndex, activityIndex });
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.classList.add('opacity-30', 'scale-95');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragItem(null);
    setDragOverItem(null);
    if (e.target instanceof HTMLElement) e.target.classList.remove('opacity-30', 'scale-95');
  };

  const handleDragOver = (e: React.DragEvent, type: 'stop' | 'day' | 'activity', stopIndex: number, dayIndex?: number, activityIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== type) return;
    if (dragOverItem?.stopIndex !== stopIndex || dragOverItem?.dayIndex !== dayIndex || dragOverItem?.activityIndex !== activityIndex) {
      setDragOverItem({ type, stopIndex, dayIndex, activityIndex });
    }
  };

  const updateDayPlanAPI = async (id: string, dayNumber: number, date: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(ENDPOINTS.DAY_PLANS.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ dayNumber, date })
      });
    } catch (err) {
      console.error("Failed to update day plan", err);
    }
  };

  const updateStopAPI = async (id: string, orderIndex: number) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(ENDPOINTS.STOPS.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orderIndex })
      });
    } catch (err) {
      console.error("Failed to update stop order", err);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'stop' | 'day' | 'activity', targetStopIndex: number, targetDayIndex?: number, targetActivityIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItem || dragItem.type !== type) return;

    if (type === 'stop') {
      if (dragItem.stopIndex === targetStopIndex) return;
      const newStops = [...stops];
      const [movedStop] = newStops.splice(dragItem.stopIndex, 1);
      newStops.splice(targetStopIndex, 0, movedStop);
      
      newStops.forEach((stop, idx) => { 
        const newOrderIndex = idx + 1;
        if (stop.orderIndex !== newOrderIndex) {
          stop.orderIndex = newOrderIndex;
          if (stop._id) updateStopAPI(stop._id, stop.orderIndex);
        }
      });
      setStops(newStops);
    } else if (type === 'day' && targetDayIndex !== undefined && dragItem.dayIndex !== undefined) {
      if (dragItem.stopIndex !== targetStopIndex) {
        showNotification("Cannot move days across different stops yet.", "error");
        setDragItem(null);
        setDragOverItem(null);
        return;
      }
      if (dragItem.dayIndex === targetDayIndex) return;

      const newStops = [...stops];
      const targetStop = newStops[targetStopIndex];
      const [movedDay] = targetStop.days.splice(dragItem.dayIndex, 1);
      targetStop.days.splice(targetDayIndex, 0, movedDay);
      
      setStops(newStops);

      targetStop.days.forEach((day, index) => {
        const newDayNumber = index + 1;
        const dayDate = new Date(targetStop.arrivalDate);
        dayDate.setDate(dayDate.getDate() + (newDayNumber - 1));
        
        if (day.dayNumber !== newDayNumber) {
           day.dayNumber = newDayNumber;
           day.date = dayDate.toISOString();
           if (day._id) updateDayPlanAPI(day._id, day.dayNumber, day.date);
        }
      });
    } else if (type === 'activity' && targetDayIndex !== undefined && targetActivityIndex !== undefined && dragItem.activityIndex !== undefined && dragItem.dayIndex !== undefined) {
      if (dragItem.stopIndex !== targetStopIndex || dragItem.dayIndex !== targetDayIndex) {
        showNotification("Cannot move activities across different days.", "error");
        setDragItem(null);
        setDragOverItem(null);
        return;
      }
      if (dragItem.activityIndex === targetActivityIndex) return;

      const newStops = [...stops];
      const targetDay = newStops[targetStopIndex].days[targetDayIndex];
      const [movedActivity] = targetDay.activities.splice(dragItem.activityIndex, 1);
      targetDay.activities.splice(targetActivityIndex, 0, movedActivity);
      
      // Note: Backend sorts by scheduledTime. In a full implementation, you'd recalculate scheduledTimes here and call API.
      setStops(newStops);
    }
    setDragItem(null);
    setDragOverItem(null);
  };

  const handleDeleteDay = async (stopIndex: number, dayIndex: number, dayId: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.DAY_PLANS.DELETE(dayId), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const newStops = [...stops];
        newStops[stopIndex].days.splice(dayIndex, 1);
        
        // Re-number remaining days and persist
        newStops[stopIndex].days.forEach((day, idx) => {
           const newDayNumber = idx + 1;
           if (day.dayNumber !== newDayNumber) {
             const dayDate = new Date(newStops[stopIndex].arrivalDate);
             dayDate.setDate(dayDate.getDate() + (newDayNumber - 1));
             day.dayNumber = newDayNumber;
             day.date = dayDate.toISOString();
             if (day._id) updateDayPlanAPI(day._id, day.dayNumber, day.date);
           }
        });
        
        setStops(newStops);
        showNotification("Day plan deleted", "success");
      } else {
        showNotification(data.message || "Failed to delete day", "error");
      }
    } catch (err) {
      showNotification("Server error", "error");
    }
  };

  const handleDeleteActivity = async (stopIndex: number, dayIndex: number, activityIndex: number, activityId: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(ENDPOINTS.ACTIVITIES.DELETE(activityId), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const newStops = [...stops];
        newStops[stopIndex].days[dayIndex].activities.splice(activityIndex, 1);
        setStops(newStops);
        showNotification("Activity deleted", "success");
      } else {
        showNotification(data.message || "Failed to delete activity", "error");
      }
    } catch (err) {
      showNotification("Server error", "error");
    }
  };

  // --- SEARCH UI HELPERS ---
  const openCitySearch = (target: 'from' | 'to') => {
    setCitySearchTarget(target);
    setSearchQuery("");
    setIsCitySearchOpen(true);
  };

  const selectCity = (city: City) => {
    if (citySearchTarget === 'from') {
      setStopForm({ ...stopForm, fromCityId: city._id });
    } else {
      setStopForm({ ...stopForm, toCityId: city._id });
    }
    setIsCitySearchOpen(false);
  };

  const openCatalogSearch = () => {
    setSearchQuery("");
    setIsCatalogSearchOpen(true);
  };

  const selectCatalogActivity = (act: CatalogActivity) => {
    setActivityForm({
      ...activityForm,
      customName: act.name,
      cost: act.cost,
      durationMins: act.durationMins,
      catalogId: act._id
    });
    setIsCatalogSearchOpen(false);
  };

  const getCityName = (id: string) => {
    return cities.find(c => c._id === id)?.name || "Select City";
  };

  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.country.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCatalog = activitiesCatalog.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.type.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light overflow-x-hidden pb-32">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
      </div>

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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-light tracking-tight italic text-emerald-900">Build <span className="font-semibold">Itinerary</span></h1>
            <p className="text-emerald-900/60 font-medium">{trip?.name} • {trip?.description}</p>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Privacy Toggle */}
            <div className="flex items-center gap-3 bg-white/60 border border-emerald-900/5 px-5 py-3 rounded-full backdrop-blur-md">
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${!trip?.isPublic ? 'text-emerald-900' : 'text-emerald-900/30'}`}>Private</span>
              <button 
                onClick={handleTogglePrivacy}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none shadow-inner ${trip?.isPublic ? 'bg-emerald-500' : 'bg-emerald-900/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-sm ${trip?.isPublic ? 'left-7' : 'left-1'}`}></div>
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${trip?.isPublic ? 'text-emerald-900' : 'text-emerald-900/30'}`}>Public</span>
            </div>

            <button onClick={() => handleOpenStopModal()} className="px-8 py-4 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.5)] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New Stop
            </button>
          </div>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-emerald-900/10 before:-z-10 pl-4">
          {stops.map((stop, index) => {
            const fromCityName = cities.find(c => c._id === stop.fromCityId)?.name || "Unknown";
            const toCityName = cities.find(c => c._id === stop.toCityId)?.name || "Unknown";
            const isDragOverStop = dragOverItem?.type === 'stop' && dragOverItem.stopIndex === index;
            
            return (
            <div 
              key={index} 
              className={`relative transition-all duration-300 ${isDragOverStop ? (dragItem!.stopIndex > index ? 'border-t-4 border-t-emerald-500 pt-4' : 'border-b-4 border-b-emerald-500 pb-4') : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, 'stop', index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, 'stop', index)}
              onDrop={(e) => handleDrop(e, 'stop', index)}
            >
              <div className="absolute left-1.5 top-10 w-4 h-4 rounded-full bg-emerald-200 border-4 border-[#f7f9f7] shadow-sm"></div>

              <div className="ml-12 bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-emerald-900/5 shadow-xl transition-all space-y-8 cursor-grab active:cursor-grabbing">
                <div className="flex items-start justify-between border-b border-emerald-900/5 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-900/20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/></svg>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/40">Stop {index + 1}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-light tracking-tight text-emerald-900">{fromCityName} <span className="italic text-emerald-900/40 mx-2">to</span> <span className="font-semibold">{toCityName}</span></h3>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenStopModal(stop); }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-900/10 shadow-sm transition-all" title="Edit Stop">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); stop._id && handleDeleteStop(stop._id, index); }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500/70 hover:text-red-600 hover:bg-red-50 border border-red-500/10 shadow-sm transition-all" title="Delete Stop">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p className="text-sm font-medium text-emerald-900/60 mt-1">{new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">Transport</p>
                    <p className="text-sm font-bold text-emerald-900 capitalize">{stop.transportType}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {stop.days.map((day, dIndex) => {
                    const isDragOverDay = dragOverItem?.type === 'day' && dragOverItem.stopIndex === index && dragOverItem.dayIndex === dIndex;
                    return (
                    <div 
                      key={day._id} 
                      className={`bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-900/5 transition-all duration-300 cursor-grab active:cursor-grabbing ${isDragOverDay ? (dragItem!.dayIndex! > dIndex ? 'border-t-4 border-t-emerald-500' : 'border-b-4 border-b-emerald-500') : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'day', index, dIndex)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, 'day', index, dIndex)}
                      onDrop={(e) => handleDrop(e, 'day', index, dIndex)}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-900/20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/></svg>
                          <h4 className="text-lg font-semibold italic text-emerald-900">Day {day.dayNumber}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); day._id && handleDeleteDay(index, dIndex, day._id); }} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500/70 hover:text-red-600 hover:bg-red-50 border border-red-500/10 shadow-sm transition-all" title="Delete Day">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); day._id && handleOpenActivityModal(index, day._id); }} className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 hover:text-emerald-700 bg-white px-4 py-2 rounded-full border border-emerald-900/10 shadow-sm transition-colors">
                            + Add Activity
                          </button>
                        </div>
                      </div>

                      {day.activities.length > 0 ? (
                        <div className="space-y-4">
                          {day.activities.map((act, aIndex) => {
                            const isDragOverActivity = dragOverItem?.type === 'activity' && dragOverItem.stopIndex === index && dragOverItem.dayIndex === dIndex && dragOverItem.activityIndex === aIndex;
                            return (
                            <div 
                              key={act._id || aIndex} 
                              className={`flex items-center justify-between bg-white/80 p-4 rounded-xl border border-emerald-900/5 shadow-sm transition-all duration-300 cursor-grab active:cursor-grabbing ${isDragOverActivity ? (dragItem!.activityIndex! > aIndex ? 'border-t-2 border-t-emerald-500' : 'border-b-2 border-b-emerald-500') : ''}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, 'activity', index, dIndex, aIndex)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, 'activity', index, dIndex, aIndex)}
                              onDrop={(e) => handleDrop(e, 'activity', index, dIndex, aIndex)}
                            >
                              <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-900/20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/></svg>
                                <div>
                                  <p className="font-bold text-emerald-900">{act.customName}</p>
                                  <p className="text-[10px] text-emerald-900/60 font-medium uppercase tracking-widest mt-1">{act.scheduledTime} • {act.durationMins} mins</p>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-4">
                                <p className="text-sm font-black text-emerald-900">{act.cost} {trip?.currency}</p>
                                <button onClick={(e) => { e.stopPropagation(); act._id && handleDeleteActivity(index, dIndex, aIndex, act._id); }} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-red-500/50 hover:text-red-600 hover:bg-red-50 border border-red-500/10 shadow-sm transition-all" title="Delete Activity">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-emerald-900/30 py-4">No activities planned yet</p>
                      )}
                    </div>
                    );
                  })}

                  <button onClick={() => handleAddDay(index)} className="w-full py-4 rounded-[2rem] border border-dashed border-emerald-900/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 hover:text-emerald-900 hover:border-emerald-900/40 transition-all">
                    + Add New Day Plan
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </main>

      {/* --- ADD STOP MODAL --- */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsStopModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white p-10 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            
            <button onClick={() => {
              if (citySearchTarget) { setCitySearchTarget(null); setSearchQuery(""); }
              else { setIsStopModalOpen(false); }
            }} className="absolute top-8 right-8 text-emerald-900/40 hover:text-emerald-900 z-10">
              {citySearchTarget ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </button>

            {!citySearchTarget ? (
              // --- FORM VIEW ---
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-3xl font-light italic text-emerald-900 mb-8">{editingStopId ? 'Edit' : 'Add'} <span className="font-semibold">{editingStopId ? 'Stop' : 'New Stop'}</span></h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">From City</label>
                    <div onClick={() => { setCitySearchTarget('from'); setSearchQuery(""); }} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 cursor-pointer hover:border-emerald-900/30 transition-colors flex justify-between items-center shadow-sm">
                      <span className={stopForm.fromCityId ? "font-semibold" : "text-emerald-900/40"}>{getCityName(stopForm.fromCityId)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-900/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">To City</label>
                    <div onClick={() => { setCitySearchTarget('to'); setSearchQuery(""); }} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 cursor-pointer hover:border-emerald-900/30 transition-colors flex justify-between items-center shadow-sm">
                      <span className={stopForm.toCityId ? "font-semibold" : "text-emerald-900/40"}>{getCityName(stopForm.toCityId)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-900/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Travel Date</label>
                    <input type="date" value={stopForm.travelDate} onChange={e => setStopForm({...stopForm, travelDate: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Stay Duration</label>
                    <div className="flex gap-2">
                      <input type="date" value={stopForm.arrivalDate} onChange={e => setStopForm({...stopForm, arrivalDate: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-4 text-emerald-900 outline-none shadow-sm" />
                      <input type="date" value={stopForm.departureDate} onChange={e => setStopForm({...stopForm, departureDate: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-4 text-emerald-900 outline-none shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Transport Type</label>
                    <select value={stopForm.transportType} onChange={e => setStopForm({...stopForm, transportType: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm">
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                      <option value="car">Car / Roadtrip</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Hotel Name</label>
                    <input type="text" placeholder="e.g. Luxury Resort" value={stopForm.hotelName} onChange={e => setStopForm({...stopForm, hotelName: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Transport Budget</label>
                    <input type="number" value={stopForm.transportBudget} onChange={e => setStopForm({...stopForm, transportBudget: Number(e.target.value)})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Stay Budget</label>
                    <input type="number" value={stopForm.stayBudget} onChange={e => setStopForm({...stopForm, stayBudget: Number(e.target.value)})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                  </div>

                  <div className="md:col-span-2 mt-6">
                    <button onClick={handleSaveStop} disabled={saving} className="w-full py-5 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-800 transition-all shadow-xl disabled:opacity-50">
                      {saving ? "Saving..." : (editingStopId ? "Save Changes" : "Create Stop")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // --- CITY SEARCH VIEW ---
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                <h2 className="text-3xl font-light italic text-emerald-900 mb-8">Select <span className="font-semibold">City</span></h2>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search cities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 pl-12 pr-6 text-emerald-900 outline-none focus:border-emerald-900/30 shadow-sm" />
                </div>
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
                  {filteredCities.map(city => (
                    <div key={city._id} onClick={() => { selectCity(city); setCitySearchTarget(null); }} className="group flex flex-col md:flex-row items-center gap-4 p-3 rounded-2xl border border-emerald-900/5 bg-white/60 hover:bg-emerald-50 cursor-pointer transition-all shadow-sm">
                      <div className="w-full md:w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={city.imageUrl || "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2"} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-emerald-900">{city.name}</h4>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-900/60 mt-0.5">{city.country} • {city.region}</p>
                          </div>
                          <div className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-black tracking-widest uppercase">
                            {city.costIndex} Cost
                          </div>
                        </div>
                        <p className="text-xs text-emerald-900/60 mt-1 line-clamp-1">{city.description}</p>
                      </div>
                    </div>
                  ))}
                  {filteredCities.length === 0 && (
                    <div className="text-center py-10 text-emerald-900/40 italic">No cities found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADD ACTIVITY MODAL --- */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setIsActivityModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white p-10 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            
            <button onClick={() => {
              if (isCatalogSearchOpen) { setIsCatalogSearchOpen(false); setSearchQuery(""); }
              else { setIsActivityModalOpen(false); }
            }} className="absolute top-8 right-8 text-emerald-900/40 hover:text-emerald-900 z-10">
              {isCatalogSearchOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </button>

            {!isCatalogSearchOpen ? (
              // --- FORM VIEW ---
              <div className="animate-in fade-in slide-in-from-left-4">
                <h2 className="text-3xl font-light italic text-emerald-900 mb-8">Add <span className="font-semibold">Activity</span></h2>
                
                <div className="space-y-6">
                  <button onClick={() => { setIsCatalogSearchOpen(true); setSearchQuery(""); }} className="w-full py-4 bg-emerald-100 text-emerald-900 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-200 transition-colors border border-emerald-900/10 flex items-center justify-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Browse Activity Catalog
                  </button>

                  <div className="relative py-2 flex items-center">
                    <div className="flex-grow border-t border-emerald-900/10"></div>
                    <span className="flex-shrink-0 mx-4 text-emerald-900/30 text-[10px] font-bold uppercase tracking-widest">OR ENTER CUSTOM</span>
                    <div className="flex-grow border-t border-emerald-900/10"></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Activity Name</label>
                    <input type="text" placeholder="e.g. Paragliding" value={activityForm.customName} onChange={e => setActivityForm({...activityForm, customName: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none focus:border-emerald-900/30 shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Time</label>
                      <input type="time" value={activityForm.scheduledTime} onChange={e => setActivityForm({...activityForm, scheduledTime: e.target.value})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Duration (Mins)</label>
                      <input type="number" value={activityForm.durationMins} onChange={e => setActivityForm({...activityForm, durationMins: Number(e.target.value)})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/70 ml-1">Cost</label>
                    <input type="number" value={activityForm.cost} onChange={e => setActivityForm({...activityForm, cost: Number(e.target.value)})} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 px-6 text-emerald-900 outline-none shadow-sm" />
                  </div>
                  <div className="pt-4">
                    <button onClick={handleSaveActivity} disabled={saving} className="w-full py-5 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-800 transition-all shadow-xl disabled:opacity-50">
                      {saving ? "Saving..." : "Add Activity"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // --- CATALOG SEARCH VIEW ---
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                <h2 className="text-3xl font-light italic text-emerald-900 mb-8">Activity <span className="font-semibold">Catalog</span></h2>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search catalog..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/80 border border-emerald-900/10 rounded-2xl py-4 pl-12 pr-6 text-emerald-900 outline-none focus:border-emerald-900/30 shadow-sm" />
                </div>
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2">
                  {filteredCatalog.map(act => (
                    <div key={act._id} onClick={() => { selectCatalogActivity(act); setIsCatalogSearchOpen(false); }} className="group flex flex-col items-start gap-4 p-4 rounded-2xl border border-emerald-900/5 bg-white/60 hover:bg-emerald-50 cursor-pointer transition-all shadow-sm">
                      <div className="w-full h-24 rounded-xl overflow-hidden">
                        <img src={act.imageUrl || "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f"} alt={act.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-emerald-900">{act.name}</h4>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-900/60 mt-0.5">{act.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-900">{act.cost} {trip?.currency}</p>
                            <p className="text-[9px] font-bold tracking-widest uppercase text-emerald-900/50">{act.durationMins} M</p>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-900/60 mt-2 line-clamp-2">{act.description}</p>
                      </div>
                    </div>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <div className="text-center py-10 text-emerald-900/40 italic">No activities found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
