import Link from "next/link";

export default function Home() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px]"></div>
      
      {/* Decorative glass elements for spacious feel */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-4xl px-8 py-20 flex flex-col items-center text-center">
        <div className="space-y-6 mb-16">
          <h1 className="text-7xl font-light tracking-tighter text-white">
            Travel <span className="font-semibold text-emerald-400">Planner</span>
          </h1>
          <p className="text-emerald-50/70 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Experience the art of seamless travel. Designed for those who seek the extraordinary in every journey.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-lg">
          <Link 
            href="/login"
            className="group relative w-full px-8 py-5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-medium tracking-widest uppercase text-sm hover:bg-emerald-400/20 transition-all duration-500 overflow-hidden"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 bg-emerald-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </Link>
          <Link 
            href="/register"
            className="w-full px-8 py-5 rounded-full bg-white text-emerald-950 font-bold tracking-widest uppercase text-sm hover:bg-emerald-50 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(52,211,153,0.3)]"
          >
            Join Now
          </Link>
        </div>

        <div className="mt-24 pt-12 border-t border-emerald-400/20 w-full flex justify-center gap-16 text-emerald-400/40 uppercase tracking-[0.3em] text-[10px] font-bold">
          <span>Global Access</span>
          <span>•</span>
          <span>Bespoke Itineraries</span>
          <span>•</span>
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
  );
}
