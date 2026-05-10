"use client";

import Link from "next/link";
import { useState } from "react";
import { ENDPOINTS } from "@/lib/api";

export default function Register() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    additionalInfo: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileImage) {
      alert("A profile photo is required to create an account.");
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        city: formData.city,
        country: formData.country,
        additionalInfo: formData.additionalInfo,
        photo: imagePreview || "",
        password: formData.password
      };

      const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        window.location.href = "/login";
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 py-4 md:py-8 overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px]"></div>
      
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-emerald-400/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-4xl p-6 md:p-10 rounded-[2.5rem] bg-emerald-950/60 backdrop-blur-2xl border border-emerald-400/20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-4 md:mb-6">
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${!profileImage ? 'border-emerald-400/50 border-dashed animate-pulse' : 'border-emerald-400'} flex items-center justify-center overflow-hidden mb-3 bg-emerald-400/5 group relative cursor-pointer shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]`}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 text-emerald-400/60 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            )}
            <input type="file" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" required />
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">Create <span className="text-emerald-400 italic">Account</span></h2>
          <p className="text-emerald-400/40 text-[9px] uppercase tracking-[0.4em] font-bold mt-1">Profile photo required</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 md:gap-y-4">
            <input 
              type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base" required
            />
          </div>

          <div>
            <textarea 
              name="additionalInfo" placeholder="Travel Preferences ...." value={formData.additionalInfo} onChange={handleChange}
              rows={1}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/30 text-white font-light text-sm md:text-base resize-none"
            ></textarea>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full py-4 md:py-5 rounded-full bg-emerald-400 text-emerald-950 font-bold tracking-widest uppercase text-[10px] md:text-xs hover:bg-emerald-300 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(52,211,153,0.3)]"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-4 md:mt-6 text-center">
          <p className="text-emerald-400/40 text-xs font-light">
            Already have an account? <Link href="/login" className="text-emerald-400 font-medium hover:text-white transition-colors">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
