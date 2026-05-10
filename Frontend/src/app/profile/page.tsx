"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    city: "",
    country: "",
    additionalInfo: ""
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfileAndTrips();
  }, []);

  const fetchProfileAndTrips = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // Fetch Profile
      const profileRes = await fetch(ENDPOINTS.AUTH.GET_PROFILE, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      
      if (profileData.success) {
        setUser(profileData.user);
        setFormData({
          firstName: profileData.user.firstName || "",
          lastName: profileData.user.lastName || "",
          phoneNumber: profileData.user.phoneNumber || "",
          city: profileData.user.city || "",
          country: profileData.user.country || "",
          additionalInfo: profileData.user.additionalInfo || ""
        });
        setImagePreview(profileData.user.photo);
      }

      // Fetch Trips
      const tripsRes = await fetch(ENDPOINTS.TRIPS.MY_TRIPS, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const tripsData = await tripsRes.json();
      if (tripsData.success) {
        setTrips(tripsData.trips);
      }
    } catch (error) {
      showNotification("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value);
      });
      if (profileImage) {
        dataToSend.append("photo", profileImage);
      }

      const response = await fetch(ENDPOINTS.AUTH.UPDATE_PROFILE, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: dataToSend
      });

      const data = await response.json();
      if (data.success) {
        showNotification("Profile updated successfully!", "success");
        setUser(data.user);
        setIsEditing(false);
      } else {
        showNotification(data.message || "Update failed", "error");
      }
    } catch (error) {
      showNotification("Server error, please try again", "error");
    } finally {
      setSaving(false);
    }
  };

  const preplannedTrips = trips.filter(t => t.status === "upcoming" || t.status === "ongoing");
  const previousTrips = trips.filter(t => t.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden pb-32">
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
          <button 
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="pt-32 px-6 max-w-7xl mx-auto space-y-24">
        {/* Profile Section */}
        <section className="bg-white/50 backdrop-blur-md p-12 rounded-[4rem] border border-emerald-900/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-16">
            {/* Image Circle */}
            <div className="relative group">
              <div className="w-48 h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-emerald-50 relative z-10">
                <img src={imagePreview || "https://ui-avatars.com/api/?name=" + user?.firstName + "+" + user?.lastName + "&background=ecfdf5&color=064e3b"} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {isEditing && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-emerald-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              )}
            </div>

            {/* Details Area */}
            <div className="flex-1 space-y-10 w-full">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-5xl font-light tracking-tight italic text-emerald-900">User <span className="font-semibold italic">Profile</span></h1>
                  <p className="text-emerald-900/60 font-medium text-[10px] uppercase tracking-[0.4em]">Personal Information</p>
                </div>
                <button 
                  onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                  disabled={saving}
                  className={`px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${
                    isEditing 
                    ? 'bg-emerald-900 text-white shadow-[0_20px_40px_-10px_rgba(6,78,59,0.3)] hover:bg-emerald-800' 
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-900/5 hover:bg-emerald-200'
                  }`}
                >
                  {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: "First Name", name: "firstName", val: formData.firstName },
                  { label: "Last Name", name: "lastName", val: formData.lastName },
                  { label: "Phone Number", name: "phoneNumber", val: formData.phoneNumber },
                  { label: "City", name: "city", val: formData.city },
                  { label: "Country", name: "country", val: formData.country },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">{field.label}</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name={field.name}
                        value={field.val}
                        onChange={handleChange}
                        className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/30 transition-all text-emerald-900"
                      />
                    ) : (
                      <div className="bg-emerald-50/50 rounded-2xl py-4 px-6 text-emerald-900 font-medium">
                        {field.val || <span className="text-emerald-900/20 italic">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/70 ml-1">About / Additional Info</label>
                  {isEditing ? (
                    <textarea 
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-white/60 border border-emerald-900/10 rounded-2xl py-4 px-6 outline-none focus:border-emerald-900/30 transition-all text-emerald-900 resize-none"
                    />
                  ) : (
                    <div className="bg-emerald-50/50 rounded-2xl py-4 px-6 text-emerald-900 font-medium min-h-[5rem]">
                      {formData.additionalInfo || <span className="text-emerald-900/20 italic">No additional information provided</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preplanned Trips */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-emerald-900/5 pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-light tracking-tight italic text-emerald-900">Preplanned <span className="font-semibold">Trips</span></h2>
              <p className="text-emerald-900/40 text-[10px] font-bold uppercase tracking-[0.2em]">Ongoing & Upcoming Journeys</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {preplannedTrips.length > 0 ? (
              preplannedTrips.map((trip) => (
                <div key={trip._id} className="group bg-white/60 backdrop-blur-md rounded-[3rem] overflow-hidden border border-emerald-900/5 shadow-xl hover:shadow-2xl transition-all">
                  <div className="aspect-[4/3] relative">
                    <img src={trip.coverPhoto || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000"} alt={trip.name} className="w-full h-full object-cover" />
                    <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-500/20 shadow-sm">{trip.status}</div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xl font-light tracking-tight text-emerald-900 truncate">{trip.name}</h4>
                      <p className="text-emerald-900/40 text-[10px] font-bold uppercase tracking-widest">{new Date(trip.startDate).toLocaleDateString()} • {trip.tripType}</p>
                    </div>
                    <Link href={`/trip/${trip._id}/itinerary`}>
                      <button className="w-full py-4 rounded-2xl bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-200 transition-colors">View Details</button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/20 rounded-[3rem] border border-dashed border-emerald-900/10">
                <p className="text-emerald-900/40 italic font-medium">No preplanned trips found</p>
              </div>
            )}
          </div>
        </section>

        {/* Previous Trips */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-emerald-900/5 pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-light tracking-tight italic text-emerald-900">Previous <span className="font-semibold">Trips</span></h2>
              <p className="text-emerald-900/40 text-[10px] font-bold uppercase tracking-[0.2em]">Memories & Past Adventures</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {previousTrips.length > 0 ? (
              previousTrips.map((trip) => (
                <div key={trip._id} className="group bg-white/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-emerald-900/5 shadow-lg hover:shadow-xl transition-all">
                  <div className="aspect-square relative opacity-80 group-hover:opacity-100 transition-opacity">
                    <img src={trip.coverPhoto || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1000"} alt={trip.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-emerald-900 truncate mb-1">{trip.name}</h4>
                    <Link href={`/trip/${trip._id}/itinerary`} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-600 transition-colors">View Entry</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white/10 rounded-[2.5rem] border border-dashed border-emerald-900/5">
                <p className="text-emerald-900/20 italic text-sm">No previous trips recorded</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
