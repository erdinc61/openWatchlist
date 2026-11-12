"use client";

import { useState } from "react";
import type { Profile, Movie } from "../types";

interface ProfileManagerProps {
  show: boolean;
  onClose: () => void;
  profiles: Profile[];
  movies: Movie[];
  onUpdateProfile: (profileId: string, updates: Partial<Profile>) => Promise<Profile>;
  onDeleteProfile: (profileId: string, password: string) => Promise<void>;
}

export default function ProfileManager({ show, onClose, profiles, movies, onUpdateProfile, onDeleteProfile }: ProfileManagerProps) {
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  if (!show) return null;

  function handleImageUpload(profileId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        await onUpdateProfile(profileId, { imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSaveEdit(profileId: string) {
    await onUpdateProfile(profileId, { username: editUsername });
    setEditingProfile(null); setEditUsername("");
  }

  async function handleDelete(profileId: string) {
    if (profiles.length <= 1) { alert("Du kannst nicht das letzte Profil löschen!"); return; }
    setDeleteError("");
    try {
      await onDeleteProfile(profileId, deletePassword);
      setDeletingProfileId(null); setDeletePassword("");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Fehler beim Löschen");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,4,7,0.9)", backdropFilter: "blur(16px)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl anim-scale-in"
        style={{ background: "#0a0a12", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bebas text-3xl tracking-wider text-white">Profile verwalten</h2>
            <p className="text-white/20 text-[9px] tracking-widest uppercase mt-0.5">{profiles.length} Profile</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "white"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {profiles.map(profile => (
            <div key={profile.id} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {editingProfile?.id === profile.id ? (
                <div className="space-y-3">
                  <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSaveEdit(profile.id)} autoFocus
                    className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 transition-all input-neon"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    placeholder="Benutzername" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(profile.id)}
                      className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold tracking-widest uppercase transition-all btn-shimmer relative"
                      style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)", boxShadow: "0 2px 12px rgba(255,0,85,0.3)" }}>
                      Speichern
                    </button>
                    <button onClick={() => { setEditingProfile(null); setEditUsername(""); }}
                      className="px-4 rounded-xl text-xs font-bold tracking-wide transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : deletingProfileId === profile.id ? (
                <div className="space-y-3">
                  <p className="text-white/40 text-xs">Passwort eingeben um <strong className="text-white">{profile.username}</strong> zu löschen:</p>
                  <input type="password" value={deletePassword}
                    onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleDelete(profile.id)}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 transition-all"
                    style={{ background: "rgba(255,0,85,0.06)", border: "1px solid rgba(255,0,85,0.2)" }}
                    placeholder="Passwort..." autoFocus />
                  {deleteError && <p className="text-[#FF0055] text-xs font-semibold">{deleteError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(profile.id)} disabled={!deletePassword}
                      className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-40"
                      style={{ background: "#FF0055", boxShadow: "0 2px 12px rgba(255,0,85,0.3)" }}>
                      Löschen
                    </button>
                    <button onClick={() => { setDeletingProfileId(null); setDeletePassword(""); setDeleteError(""); }}
                      className="px-4 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative group flex-shrink-0">
                    {profile.imageUrl
                      ? <img src={profile.imageUrl} alt={profile.username} className="w-14 h-14 rounded-xl object-cover" />
                      : <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl"
                          style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)" }}>
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                    }
                    <label htmlFor={`upload-${profile.id}`}
                      className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      style={{ background: "rgba(4,4,7,0.75)" }}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input type="file" id={`upload-${profile.id}`} accept="image/*"
                      onChange={e => handleImageUpload(profile.id, e)} className="hidden" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm">{profile.username}</h3>
                    <p className="text-white/25 text-xs mt-0.5 tracking-wide">
                      {movies.filter(m => m.addedBy === profile.id).length} Einträge
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingProfile(profile); setEditUsername(profile.username); }}
                      className="p-2 rounded-xl transition-all" title="Bearbeiten"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "white"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeletingProfileId(profile.id)}
                      className="p-2 rounded-xl transition-all disabled:opacity-30" title="Löschen"
                      disabled={profiles.length <= 1}
                      style={{ background: "rgba(255,0,85,0.1)", border: "1px solid rgba(255,0,85,0.2)", color: "#FF0055" }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
