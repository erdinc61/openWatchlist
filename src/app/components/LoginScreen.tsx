"use client";

interface LoginScreenProps {
  password: string;
  setPassword: (password: string) => void;
  error: boolean;
  onSubmit: () => void;
}

export default function LoginScreen({ password, setPassword, error, onSubmit }: LoginScreenProps) {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden scanlines">

      {/* Scanline sweep */}
      <div
        className="absolute inset-x-0 h-32 pointer-events-none opacity-[0.025]"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(255,0,85,0.6), transparent)",
          animation: "scanline 8s linear infinite",
          zIndex: 2,
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#FF0055]/30 pointer-events-none" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[#FF0055]/30 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[#FF0055]/30 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#FF0055]/30 pointer-events-none" />

      {/* Center spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,0,85,0.06) 0%, transparent 70%)",
          animation: "spotlightPulse 4s ease-in-out infinite",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12 anim-fade-up">
          <div className="inline-block mb-4 anim-float">
            <div className="relative">
              <div className="w-14 h-14 mx-auto bg-[#FF0055] rounded-2xl flex items-center justify-center neon-glow">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 3.882C4 3.395 4.526 3.1 4.933 3.366l14.312 8.618a.5.5 0 010 .848L4.933 21.35C4.526 21.616 4 21.321 4 20.834V3.882z"/>
                </svg>
              </div>
            </div>
          </div>

          <h1
            className="font-bebas text-5xl sm:text-7xl tracking-[0.05em] leading-none anim-flicker"
            style={{ color: "#FF0055", textShadow: "0 0 30px rgba(255,0,85,0.5), 0 0 60px rgba(255,0,85,0.2)" }}
          >
            openWatchlist
          </h1>
          <p className="text-white/25 text-xs tracking-[0.3em] uppercase mt-2 font-medium">
            track together
          </p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-2xl p-8 anim-fade-up card-border"
          style={{
            background: "rgba(14, 14, 24, 0.9)",
            backdropFilter: "blur(20px)",
            animationDelay: "100ms",
          }}
        >
          <p className="text-white/40 text-xs text-center mb-6 tracking-widest uppercase">
            Passwort eingeben
          </p>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSubmit()}
              placeholder="••••••••"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-5 py-4 text-white text-center placeholder-white/20 text-lg tracking-[0.25em] transition-all input-neon"
            />

            {error && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#FF0055] neon-glow-sm" />
                <p className="text-[#FF0055] text-xs tracking-widest uppercase font-medium">Falsches Passwort</p>
              </div>
            )}

            <button
              onClick={onSubmit}
              className="relative w-full py-4 rounded-xl text-white font-bold text-sm tracking-[0.15em] uppercase transition-all btn-shimmer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #FF0055 0%, #CC0044 100%)",
                boxShadow: "0 4px 20px rgba(255,0,85,0.3), 0 0 40px rgba(255,0,85,0.1)",
              }}
            >
              Einloggen
            </button>
          </div>
        </div>

        {/* Film strip bottom */}
        <div className="flex justify-center gap-1 mt-8 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-4 h-3 border border-white/50 rounded-[2px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
