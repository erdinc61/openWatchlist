"use client";

interface CreateProfileModalProps {
  show: boolean;
  onClose: () => void;
  newProfileName: string;
  setNewProfileName: (name: string) => void;
  onCreate: () => void;
}

export default function CreateProfileModal({ show, onClose, newProfileName, setNewProfileName, onCreate }: CreateProfileModalProps) {
  if (!show) return null;

  function handleCreate() { onCreate(); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,4,7,0.9)", backdropFilter: "blur(16px)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-8 max-w-sm w-full shadow-2xl anim-scale-in card-border"
        style={{ background: "#0a0a12", border: "1px solid rgba(255,255,255,0.09)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "rgba(255,0,85,0.12)", border: "1px solid rgba(255,0,85,0.2)" }}>👤</div>
          <div>
            <h2 className="font-bebas text-2xl tracking-wider text-white">Neues Profil</h2>
            <p className="text-white/25 text-xs tracking-widest uppercase">Benutzername wählen</p>
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={newProfileName}
            onChange={e => setNewProfileName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="Benutzername"
            autoFocus
            className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/20 text-sm transition-all input-neon"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newProfileName.trim()}
              className="relative flex-1 py-3.5 rounded-xl text-white font-bold text-sm tracking-[0.1em] uppercase transition-all btn-shimmer disabled:opacity-40 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)", boxShadow: "0 4px 16px rgba(255,0,85,0.3)" }}>
              Erstellen
            </button>
            <button onClick={() => { onClose(); setNewProfileName(""); }}
              className="px-5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
