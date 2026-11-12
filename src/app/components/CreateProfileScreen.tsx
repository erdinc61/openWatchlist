"use client";

interface CreateProfileScreenProps {
  newProfileName: string;
  setNewProfileName: (name: string) => void;
  onCreate: () => void;
}

export default function CreateProfileScreen({ newProfileName, setNewProfileName, onCreate }: CreateProfileScreenProps) {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-[#FF0055]/20 pointer-events-none" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r border-t border-[#FF0055]/20 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-[#FF0055]/20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-[#FF0055]/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm anim-fade-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 text-3xl anim-float"
            style={{ background: "rgba(255,0,85,0.12)", border: "1px solid rgba(255,0,85,0.2)" }}>
            👤
          </div>
          <h2 className="font-bebas text-5xl tracking-[0.06em]" style={{ color: "#FF0055" }}>
            Willkommen!
          </h2>
          <p className="text-white/25 text-xs tracking-widest uppercase mt-2">Erstelle dein Profil</p>
        </div>

        <div className="rounded-2xl p-8 card-border" style={{ background: "rgba(14,14,24,0.9)", backdropFilter: "blur(20px)" }}>
          <div className="space-y-4">
            <input
              type="text"
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onCreate()}
              placeholder="Dein Benutzername"
              autoFocus
              className="w-full rounded-xl px-5 py-4 text-white placeholder-white/20 text-sm transition-all input-neon"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button onClick={onCreate} disabled={!newProfileName.trim()}
              className="relative w-full py-4 rounded-xl text-white font-bold text-sm tracking-[0.1em] uppercase transition-all btn-shimmer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)", boxShadow: "0 4px 20px rgba(255,0,85,0.3)" }}>
              Profil erstellen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
