"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface PackingItem {
  _id: string;
  tripId: string;
  category: string;
  itemName: string;
  quantity: number;
  isPacked: boolean;
}

interface ChecklistData {
  [category: string]: PackingItem[];
}

interface Progress {
  totalItems: number;
  packedItems: number;
  percentage: number;
}

const CATEGORIES = [
  "documents",
  "clothing",
  "electronics",
  "toiletries",
  "medicines",
  "accessories",
  "food",
  "others",
];

export default function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [tripName, setTripName] = useState<string>("");
  const [checklist, setChecklist] = useState<ChecklistData>({});
  const [progress, setProgress] = useState<Progress>({ totalItems: 0, packedItems: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ itemName: "", category: "documents", quantity: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTripName();
    fetchChecklist();
  }, [id]);

  const fetchTripName = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(ENDPOINTS.TRIPS.GET_SINGLE(id), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTripName(data.trip.name);
    } catch {}
  };

  const fetchChecklist = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(ENDPOINTS.PACKING.GET_CHECKLIST(id), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChecklist(data.checklist || {});
        setProgress(data.progress || { totalItems: 0, packedItems: 0, percentage: 0 });
      }
    } catch (err) {
      console.error("Failed to load checklist", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: PackingItem) => {
    if (togglingId === item._id) return;
    setTogglingId(item._id);

    // Optimistic update
    const newChecklist = { ...checklist };
    const catItems = newChecklist[item.category].map(i =>
      i._id === item._id ? { ...i, isPacked: !i.isPacked } : i
    );
    newChecklist[item.category] = catItems;
    setChecklist(newChecklist);

    // Update progress optimistically
    const newPacked = item.isPacked ? progress.packedItems - 1 : progress.packedItems + 1;
    const total = progress.totalItems;
    setProgress({ totalItems: total, packedItems: newPacked, percentage: total === 0 ? 0 : Math.round((newPacked / total) * 100) });

    try {
      const token = localStorage.getItem("token");
      await fetch(ENDPOINTS.PACKING.TOGGLE(item._id), {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch {
      // Revert on error
      fetchChecklist();
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddItem = async () => {
    if (!addForm.itemName.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(ENDPOINTS.PACKING.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          tripId: id,
          category: addForm.category,
          itemName: addForm.itemName.trim(),
          quantity: addForm.quantity
        })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the full checklist to get updated state
        await fetchChecklist();
        setAddForm({ itemName: "", category: "documents", quantity: 1 });
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Failed to add item", err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = async () => {
    // Toggle all packed items to unpacked
    const allPackedItems: PackingItem[] = [];
    Object.values(checklist).forEach(items => {
      items.forEach(item => { if (item.isPacked) allPackedItems.push(item); });
    });
    // Optimistic reset
    const newChecklist: ChecklistData = {};
    Object.keys(checklist).forEach(cat => {
      newChecklist[cat] = checklist[cat].map(i => ({ ...i, isPacked: false }));
    });
    setChecklist(newChecklist);
    setProgress(p => ({ ...p, packedItems: 0, percentage: 0 }));
  };

  // Gather all categories that have items, and apply search filter
  const categoriesWithItems = Object.entries(checklist).filter(([_, items]) => {
    if (!items || items.length === 0) return false;
    if (search) {
      return items.some(i => i.itemName.toLowerCase().includes(search.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      <Navbar />
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
      </div>

      <main className="pt-32 pb-40 px-6 max-w-3xl mx-auto space-y-8">

        {/* Top Controls: Search + Filter row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Search bar ......"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/60 border border-emerald-900/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-emerald-900/20 transition-all placeholder:text-emerald-900/30 text-emerald-900 shadow-sm backdrop-blur-md"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-900/20 group-focus-within:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-4 bg-white/60 border border-emerald-900/5 rounded-2xl text-emerald-900/40 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-900 hover:border-emerald-900/20 transition-all shadow-sm backdrop-blur-md whitespace-nowrap">Group by</button>
            <button className="px-5 py-4 bg-white/60 border border-emerald-900/5 rounded-2xl text-emerald-900/40 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-900 hover:border-emerald-900/20 transition-all shadow-sm backdrop-blur-md whitespace-nowrap">Filter</button>
            <button className="px-5 py-4 bg-white/60 border border-emerald-900/5 rounded-2xl text-emerald-900/40 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-900 hover:border-emerald-900/20 transition-all shadow-sm backdrop-blur-md whitespace-nowrap">Sort by...</button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-900/40">Packing checklist</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-emerald-900">
            Trip: <span className="italic font-semibold">{tripName || "..."}</span>
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/60 border border-emerald-900/5 rounded-3xl p-6 space-y-3 backdrop-blur-sm shadow-sm">
          <p className="text-sm text-emerald-900 font-medium">
            Progress: <span className="font-bold">{progress.packedItems}/{progress.totalItems} items packed</span>
          </p>
          <div className="h-3 w-full bg-emerald-900/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Checklist Body */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin" />
          </div>
        ) : categoriesWithItems.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-emerald-900/40 font-bold uppercase tracking-widest text-xs">
              {search ? "No items match your search" : "No packing items yet"}
            </p>
            <p className="text-emerald-900/30 text-sm">Click "+ Add item to checklist" to get started</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categoriesWithItems.map(([category, items]) => {
              const filtered = search
                ? items.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()))
                : items;
              if (filtered.length === 0) return null;

              const catPacked = filtered.filter(i => i.isPacked).length;

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between bg-emerald-900 text-white px-5 py-3 rounded-2xl mb-4">
                    <h3 className="font-semibold capitalize tracking-wide">{category}</h3>
                    <span className="font-bold text-sm text-emerald-200">{catPacked}/{filtered.length}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 pl-2">
                    {filtered.map((item) => (
                      <label
                        key={item._id}
                        className={`flex items-center gap-4 group cursor-pointer px-4 py-3 rounded-xl transition-all duration-200 ${item.isPacked ? "bg-emerald-900/5" : "hover:bg-white/60"}`}
                        onClick={() => handleToggle(item)}
                      >
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${item.isPacked ? "bg-emerald-700 border-emerald-700" : "border-emerald-900/30 group-hover:border-emerald-700"} ${togglingId === item._id ? "opacity-50" : ""}`}>
                          {item.isPacked && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Item Name */}
                        <span className={`text-base transition-all ${item.isPacked ? "text-emerald-900/40 line-through" : "text-emerald-900 group-hover:text-emerald-700"}`}>
                          {item.itemName}
                          {item.quantity > 1 && (
                            <span className="ml-2 text-xs text-emerald-900/40 font-medium">×{item.quantity}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/60 border-t border-emerald-900/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 py-4 border-2 border-emerald-900/20 text-emerald-900 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-900 hover:text-white hover:border-emerald-900 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + add item to checklist
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleResetAll}
              className="flex-1 md:flex-none px-8 py-4 bg-white border border-emerald-900/10 text-emerald-900 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-sm whitespace-nowrap"
            >
              Reset all
            </button>
            <button className="flex-1 md:flex-none px-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.4)] whitespace-nowrap">
              Share Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light tracking-tight text-emerald-900">Add <span className="font-semibold italic">Item</span></h2>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Item Name</label>
                <input
                  type="text"
                  value={addForm.itemName}
                  onChange={(e) => setAddForm({ ...addForm, itemName: e.target.value })}
                  placeholder="e.g. Passport, Charger..."
                  autoFocus
                  className="w-full border border-emerald-900/10 rounded-xl px-5 py-3 outline-none focus:border-emerald-700 text-emerald-900 placeholder:text-emerald-900/30 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Category</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full border border-emerald-900/10 rounded-xl px-5 py-3 outline-none focus:border-emerald-700 text-emerald-900 bg-white capitalize transition-colors"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900/50">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({ ...addForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full border border-emerald-900/10 rounded-xl px-5 py-3 outline-none focus:border-emerald-700 text-emerald-900 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleAddItem}
              disabled={saving || !addForm.itemName.trim()}
              className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-[0_10px_30px_-10px_rgba(6,78,59,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Adding..." : "Add to Checklist"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
