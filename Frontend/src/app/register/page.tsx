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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
  };

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
      showNotification("A profile photo is required", "warning");
      return;
    }

    try {
      // Basic validation
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'country', 'password'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        showNotification("Please fill in all required fields", "warning");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phone);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("additionalInfo", formData.additionalInfo);
      formDataToSend.append("password", formData.password);
      
      if (profileImage) {
        formDataToSend.append("photo", profileImage);
      }

      const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showNotification("Account created successfully! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showNotification(data.message || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      showNotification("Connection error. Please try again.", "error");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative px-4 py-4 md:py-8 overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Toast Notification */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${notification.visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full backdrop-blur-xl border flex items-center gap-3 shadow-2xl ${
          notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
          'bg-amber-500/20 border-amber-500/50 text-amber-400'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            notification.type === 'success' ? 'bg-emerald-400' : 
            notification.type === 'error' ? 'bg-red-400' : 'bg-amber-400'
          }`}></div>
          <span className="text-sm font-medium tracking-wide">{notification.message}</span>
        </div>
      </div>

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
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
            <input 
              type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base" required
            />
          </div>

          <div>
            <textarea 
              name="additionalInfo" placeholder="Travel Preferences ...." value={formData.additionalInfo} onChange={handleChange}
              rows={1}
              className="w-full px-5 py-2.5 md:py-3 bg-emerald-950/40 rounded-xl md:rounded-2xl border border-emerald-400/20 focus:border-emerald-400 outline-none transition-all placeholder:text-emerald-100/60 text-white font-light text-sm md:text-base resize-none"
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
