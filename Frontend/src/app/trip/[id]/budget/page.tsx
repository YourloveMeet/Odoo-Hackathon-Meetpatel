"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ENDPOINTS } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface BudgetItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  amount: number;
  date: string;
}

interface Summary {
  transport: number;
  stay: number;
  activities: number;
  meals: number;
  shopping: number;
  tickets: number;
  other: number;
}

export default function BudgetInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      // Trip details
      const tr = await fetch(ENDPOINTS.TRIPS.GET_SINGLE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const td = await tr.json();
      if (td.success) setTrip(td.trip);

      // Budget items
      const br = await fetch(ENDPOINTS.BUDGET.FILTER, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tripId: id })
      });
      const bd = await br.json();
      if (bd.success) {
        setItems(bd.budgetItems || []);
        setSummary(bd.summary || null);
        setTotalSpent(bd.totalBudget || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n?.toLocaleString("en-IN") || "0";
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A";

  const budgetLimit = trip?.totalBudget || 0;
  const remaining = budgetLimit - totalSpent;
  const tax = totalSpent * 0.05;
  const grandTotal = totalSpent + tax;

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );
  const handleDownloadCSV = () => {
    const headers = ["#", "Category", "Title", "Description", "Amount"];
    const rows = filteredItems.map((item, idx) => [
      idx + 1,
      item.category,
      item.title,
      item.description || "N/A",
      item.amount
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Budget_${trip?.name || 'Trip'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f7f9f7',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${trip?.name || 'Trip'}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-emerald-950 font-light selection:bg-emerald-200 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#e8f2e8] rounded-full blur-[120px] opacity-60"></div>
      </div>

      <Navbar />

      <main className="pt-32 pb-24 px-8 max-w-[1400px] mx-auto relative z-10">
        {/* Quick Search */}
        <div className="max-w-md mx-auto mb-16">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-emerald-900/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all pl-12 shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {/* Back Link */}
        <Link href="/my-trips" className="flex items-center gap-2 text-emerald-900/40 hover:text-emerald-900 transition-colors text-[10px] mb-8 group w-fit uppercase font-black tracking-[0.2em]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7 7-7" /></svg>
          back to My Trips
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin" />
            <p className="text-emerald-900/30 text-[10px] font-bold uppercase tracking-[0.3em]">Preparing Billing Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            {/* Main Invoice Section */}
            <div id="invoice-content" className="lg:col-span-3 space-y-10">
              
              {/* Header Info Card */}
              <div className="bg-white/70 backdrop-blur-sm border border-emerald-900/5 rounded-[2.5rem] p-10 flex flex-wrap gap-12 shadow-sm">
                
                {/* Trip Branding */}
                <div className="flex gap-8 items-start flex-1 min-w-[350px]">
                  <div className="w-40 h-40 rounded-[2rem] bg-emerald-900/5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-emerald-900/5 shadow-inner">
                    {trip?.coverPhoto ? <img src={trip.coverPhoto} className="w-full h-full object-cover" /> : (
                      <div className="text-4xl opacity-20">🌍</div>
                    )}
                  </div>
                  <div className="space-y-3 pt-2">
                    <h2 className="text-3xl font-bold tracking-tight text-emerald-900">{trip?.name}</h2>
                    <p className="text-emerald-900/40 text-[10px] uppercase font-black tracking-[0.25em]">
                      {formatDate(trip?.startDate)} — {formatDate(trip?.endDate)}
                    </p>
                    <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-widest rounded-full">
                      {trip?.totalDays} Days Journey
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-10 flex-[1.5]">
                  <div className="space-y-1.5">
                    <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.2em]">Invoice Id</p>
                    <p className="text-emerald-900 font-bold tracking-tight">INV-{id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.2em]">Generated date</p>
                    <p className="text-emerald-900 font-bold">{formatDate(new Date().toISOString())}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.2em]">Traveler Details:</p>
                    <div className="text-emerald-900/60 text-xs font-semibold leading-relaxed">
                      {trip?.tripType === 'solo' ? <p>Solo Adventurer</p> : (
                        <div className="space-y-0.5">
                          <p>James (Creator)</p>
                          <p>Group Member #2</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.2em]">Payment status</p>
                    <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Pending Approval
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white border border-emerald-900/5 rounded-[2.5rem] overflow-hidden shadow-xl shadow-emerald-900/[0.02]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-900/5 border-b border-emerald-900/5">
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-emerald-900/30">#</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Category</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Description</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Qty/details</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Unit Cost</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-emerald-900/30 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/5">
                    {filteredItems.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-10 py-8 text-emerald-900/30 font-bold text-xs">{idx + 1}</td>
                        <td className="px-10 py-8">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-emerald-900 font-bold text-sm break-all">{item.title}</td>
                        <td className="px-10 py-8 text-emerald-900/40 text-[11px] font-medium italic break-all">{item.description || "System automatic"}</td>
                        <td className="px-10 py-8 text-emerald-900/60 font-bold text-xs">{fmt(item.amount)}</td>
                        <td className="px-10 py-8 text-emerald-900 font-black text-sm text-right">{fmt(item.amount)}</td>
                      </tr>
                    ))}
                    {/* Empty Rows */}
                    {[...Array(Math.max(0, 4 - filteredItems.length))].map((_, i) => (
                      <tr key={`empty-${i}`} className="h-20">
                        <td colSpan={6} />
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Section */}
                <div className="p-10 border-t border-emerald-900/5 bg-emerald-50/30 flex justify-end">
                  <div className="w-80 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-900/40 font-black uppercase tracking-widest">Subtotal</span>
                      <span className="text-emerald-900 font-bold">{trip?.currency} {fmt(totalSpent)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-900/40 font-black uppercase tracking-widest">tax(5%)</span>
                      <span className="text-emerald-900 font-bold">{trip?.currency} {fmt(tax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-900/40 font-black uppercase tracking-widest">Discount</span>
                      <span className="text-emerald-600 font-bold">-{trip?.currency} 0</span>
                    </div>
                    <div className="h-px bg-emerald-900/10 my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-900 font-black uppercase tracking-[0.3em] text-[10px]">Grand Total</span>
                      <span className="text-3xl font-black text-emerald-900 tracking-tighter">{trip?.currency} {fmt(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Insights Section */}
            <div className="space-y-10">
              
              <div className="bg-emerald-900 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 blur-[50px] rounded-full" />
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10">budgetInsights</h3>
                
                {/* Visual Chart */}
                <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      className="stroke-emerald-400" 
                      strokeWidth="3" 
                      strokeDasharray={`${Math.min(100, (totalSpent/budgetLimit)*100)}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{Math.round((totalSpent/budgetLimit)*100)}%</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Spent</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">Total Budget:</span>
                    <span>{fmt(budgetLimit)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">total spent:</span>
                    <span>{fmt(totalSpent)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">Remaining:</span>
                    <span className={remaining < 0 ? 'text-red-400' : 'text-emerald-400'}>{fmt(remaining)}</span>
                  </div>
                </div>

                <button className="w-full mt-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all">
                  View Full Budget
                </button>
              </div>

              {/* Status Note */}
              <div className="bg-white border border-emerald-900/5 rounded-[2.5rem] p-8 text-center shadow-sm">
                <p className="text-emerald-900/20 font-black uppercase tracking-[0.3em] text-[8px] mb-4">Billing Notice</p>
                <p className="text-emerald-900/50 text-[11px] font-medium leading-relaxed italic">
                  "Keep all digital receipts in your Journal for easy reconciliation later."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Footer Actions */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-5 bg-white/80 backdrop-blur-2xl border border-emerald-900/5 shadow-2xl z-50 min-w-[500px] justify-center rounded-[2rem]">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadCSV}
              className="px-8 py-3 bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-emerald-900/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-8 py-3 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF Export
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
