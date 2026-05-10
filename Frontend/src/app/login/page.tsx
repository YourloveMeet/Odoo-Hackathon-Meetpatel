"use client";

import Link from "next/link";
import { useState } from "react";
import { ENDPOINTS } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        alert("Login successful!");
        // Store token/redirect logic here
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px]"></div>

      <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-emerald-400/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-lg p-12 md:p-16 rounded-[3rem] bg-emerald-950/60 backdrop-blur-2xl border border-emerald-400/20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-full border border-emerald-400/30 flex items-center justify-center overflow-hidden mb-6 bg-emerald-400/5 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-light tracking-tight text-white">Travel <span className="text-emerald-400 italic">Login</span></h2>
          <p className="text-emerald-400/40 text-xs uppercase tracking-[0.4em] font-bold mt-3">Welcome Back</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="group relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-emerald-950/40 rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white text-lg font-light"
                required
              />
            </div>

            <div className="group relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-emerald-950/40 rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white text-lg font-light"
                required
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="w-full py-5 rounded-full bg-emerald-400 text-emerald-950 font-bold tracking-widest uppercase text-sm hover:bg-emerald-300 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(52,211,153,0.3)]"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className="text-emerald-400/40 text-sm font-light">
            New traveler? <Link href="/register" className="text-emerald-400 font-medium hover:text-white transition-colors">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
