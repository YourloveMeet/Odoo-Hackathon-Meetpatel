"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";
import Navbar from "@/components/Navbar";

type NoteType = "trip" | "stop" | "day" | "activity";

interface Note {
  _id: string;
  tripId: string;
  stopId?: string;
  dayPlanId?: string;
  activityId?: string;
  title: string;
  note: string;
  noteType: NoteType;
  createdAt: string;
}

interface Stop {
  _id: string;
  fromCity?: string;
  toCity?: string;
  fromCityId?: any;
  toCityId?: any;
  days: Day[];
}

interface Day {
  _id: string;
  dayNumber: number;
  date: string;
  activities: Activity[];
}

interface Activity {
  _id: string;
  customName?: string;
  name?: string;
}

export default function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [tripName, setTripName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | NoteType>("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [noteType, setNoteType] = useState<NoteType>("trip");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    const token = localStorage.getItem("token");
    try {
      // Trip name
      const tr = await fetch(ENDPOINTS.TRIPS.GET_SINGLE(id), { headers: { Authorization: `Bearer ${token}` } });
      const td = await tr.json();
      if (td.success) setTripName(td.trip.name);

      // Notes
      const nr = await fetch(ENDPOINTS.NOTES.GET_BY_TRIP(id), { headers: { Authorization: `Bearer ${token}` } });
      const nd = await nr.json();
      if (nd.success) setNotes(nd.notes || nd.tripNotes || []);

      // Stops + Days + Activities
      const sr = await fetch(ENDPOINTS.STOPS.GET_BY_TRIP(id), { headers: { Authorization: `Bearer ${token}` } });
      const sd = await sr.json();
      if (sd.success) {
        const fetchedStops: Stop[] = sd.stops || [];
        for (const stop of fetchedStops) {
          const dr = await fetch(ENDPOINTS.DAY_PLANS.GET_BY_STOP(stop._id), { headers: { Authorization: `Bearer ${token}` } });
          const dd = await dr.json();
          stop.days = dd.success ? dd.dayPlans : [];
          for (const day of stop.days) {
            const ar = await fetch(ENDPOINTS.ACTIVITIES.GET_BY_DAYPLAN(day._id), { headers: { Authorization: `Bearer ${token}` } });
            const ad = await ar.json();
            day.activities = ad.success ? ad.activities : [];
          }
        }
        setStops(fetchedStops);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingNote(null);
    setNoteType("trip");
    setSelectedStopId("");
    setSelectedDayId("");
    setSelectedActivityId("");
    setTitle("");
    setNoteText("");
    setShowModal(true);
  };

  const openEditModal = (n: Note) => {
    setEditingNote(n);
    setNoteType(n.noteType);
    setSelectedStopId(n.stopId || "");
    setSelectedDayId(n.dayPlanId || "");
    setSelectedActivityId(n.activityId || "");
    setTitle(n.title);
    setNoteText(n.note);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !noteText.trim()) return;
    setSaving(true);
    const token = localStorage.getItem("token");

    const payload: any = { tripId: id, title: title.trim(), note: noteText.trim(), noteType };
    if (noteType !== "trip" && selectedStopId) payload.stopId = selectedStopId;
    if ((noteType === "day" || noteType === "activity") && selectedDayId) payload.dayPlanId = selectedDayId;
    if (noteType === "activity" && selectedActivityId) payload.activityId = selectedActivityId;

    try {
      const url = editingNote ? ENDPOINTS.NOTES.UPDATE(editingNote._id) : ENDPOINTS.NOTES.CREATE;
      const method = editingNote ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        setShowModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(ENDPOINTS.NOTES.DELETE(noteId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (e) {
      console.error(e);
    }
  };

  const selectedStop = stops.find(s => s._id === selectedStopId);
  const selectedDay = selectedStop?.days.find(d => d._id === selectedDayId);

  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.note.toLowerCase().includes(search.toLowerCase());
    // Treat missing/undefined noteType as 'trip'
    const effectiveType: NoteType = (n.noteType as NoteType) || "trip";
    const matchType = filterType === "all" || effectiveType === filterType;
    return matchSearch && matchType;
  });

  const typeColor: Record<NoteType, string> = {
    trip: "bg-emerald-100 text-emerald-800",
    stop: "bg-blue-100 text-blue-800",
    day: "bg-amber-100 text-amber-800",
    activity: "bg-purple-100 text-purple-800",
  };

  const getStopLabel = (stop: Stop) => {
    const from = stop.fromCity || stop.fromCityId?.name || "?";
    const to = stop.toCity || stop.toCityId?.name || "?";
    return `${from} → ${to}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-50" />
      </div>

      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto space-y-8">

        {/* Search + Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input type="text" placeholder="Search bar ......" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-emerald-900/20 placeholder:text-emerald-900/30 text-emerald-900 shadow-sm backdrop-blur-md transition-all" />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-900/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex gap-3">
            {(["all", "stop", "day", "activity"] as const).map(f => (
              <button key={f} onClick={() => setFilterType(f)}
                className={`px-5 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm whitespace-nowrap ${filterType === f ? "bg-emerald-900 text-white" : "bg-white/60 border border-emerald-900/5 text-emerald-900/40 hover:text-emerald-900 hover:border-emerald-900/20 backdrop-blur-md"}`}>
                {f === "all" ? "All" : `By ${f}`}
              </button>
            ))}
          </div>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-900/40">Trip Journal</p>
            <h1 className="text-4xl font-light tracking-tight text-emerald-900">
              Trip: <span className="italic font-semibold">{tripName || "..."}</span>
            </h1>
          </div>
          <button onClick={openAddModal}
            className="px-6 py-3 bg-emerald-900 text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.4)] flex items-center gap-2 whitespace-nowrap flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Note
          </button>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs">{search ? "No notes match your search" : "No journal notes yet"}</p>
            <p className="text-emerald-900/30 text-sm">Click "+ Add Note" to start your trip journal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map(n => {
              const effectiveType: NoteType = (n.noteType as NoteType) || "trip";
              const borderAccent: Record<NoteType, string> = {
                trip: "border-l-emerald-500",
                stop: "border-l-blue-400",
                day: "border-l-amber-400",
                activity: "border-l-purple-400",
              };
              const badgeBg: Record<NoteType, string> = {
                trip: "bg-emerald-100 text-emerald-700",
                stop: "bg-blue-100 text-blue-700",
                day: "bg-amber-100 text-amber-700",
                activity: "bg-purple-100 text-purple-700",
              };
              return (
                <div key={n._id} className={`bg-white border-l-4 ${borderAccent[effectiveType]} border border-emerald-900/5 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${badgeBg[effectiveType]}`}>
                          {effectiveType}
                        </span>
                        <h3 className="text-lg font-semibold text-emerald-900">{n.title}</h3>
                      </div>
                      <p className="text-emerald-900/60 leading-relaxed text-sm">{n.note}</p>
                      <p className="text-[10px] text-emerald-900/30 font-medium uppercase tracking-widest">
                        {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEditModal(n)} className="w-9 h-9 bg-emerald-50 border border-emerald-900/5 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(n._id)} className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light tracking-tight text-emerald-900">
                {editingNote ? "Edit" : "Add"} <span className="font-semibold italic">Note</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Note Type Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Note Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["trip", "stop", "day", "activity"] as NoteType[]).map(t => (
                  <button key={t} onClick={() => { setNoteType(t); setSelectedStopId(""); setSelectedDayId(""); setSelectedActivityId(""); }}
                    className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${noteType === t ? "bg-emerald-900 text-white border-emerald-900" : "bg-white border-emerald-900/10 text-emerald-900/50 hover:border-emerald-900/30 hover:text-emerald-900"}`}>
                    By {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Selector */}
            {(noteType === "stop" || noteType === "day" || noteType === "activity") && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Select Stop</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stops.map((stop, si) => (
                    <button key={stop._id} onClick={() => { setSelectedStopId(stop._id); setSelectedDayId(""); setSelectedActivityId(""); }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${selectedStopId === stop._id ? "bg-emerald-900 text-white border-emerald-900" : "bg-white border-emerald-900/10 text-emerald-900 hover:border-emerald-900/30"}`}>
                      <span className="font-semibold">Stop {si + 1}</span>
                      <span className="ml-2 opacity-70">{getStopLabel(stop)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Day Selector */}
            {(noteType === "day" || noteType === "activity") && selectedStop && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Select Day</label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedStop.days.map(day => (
                    <button key={day._id} onClick={() => { setSelectedDayId(day._id); setSelectedActivityId(""); }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${selectedDayId === day._id ? "bg-emerald-900 text-white border-emerald-900" : "bg-white border-emerald-900/10 text-emerald-900 hover:border-emerald-900/30"}`}>
                      <span className="font-semibold">Day {day.dayNumber}</span>
                      <span className="ml-2 opacity-70">{new Date(day.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Selector */}
            {noteType === "activity" && selectedDay && selectedDay.activities.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Select Activity</label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedDay.activities.map(act => (
                    <button key={act._id} onClick={() => setSelectedActivityId(act._id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${selectedActivityId === act._id ? "bg-emerald-900 text-white border-emerald-900" : "bg-white border-emerald-900/10 text-emerald-900 hover:border-emerald-900/30"}`}>
                      {act.customName || act.name || "Activity"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Hotel check-in details"
                className="w-full border border-emerald-900/10 rounded-xl px-5 py-3 outline-none focus:border-emerald-700 text-emerald-900 placeholder:text-emerald-900/30 transition-colors" />
            </div>

            {/* Note Text */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Note</label>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Write your note here..." rows={4}
                className="w-full border border-emerald-900/10 rounded-xl px-5 py-3 outline-none focus:border-emerald-700 text-emerald-900 placeholder:text-emerald-900/30 transition-colors resize-none" />
            </div>

            <button onClick={handleSave} disabled={saving || !title.trim() || !noteText.trim()}
              className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
