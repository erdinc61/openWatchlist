"use client";

import type { Profile } from "../types";

interface NavigationProps {
  currentProfile: Profile;
  profiles: Profile[];
  showProfileSelector: boolean;
  setShowProfileSelector: (show: boolean) => void;
  onProfileSelect: (profile: Profile) => void;
  onOpenProfileManager: () => void;
  onOpenCreateProfile: () => void;
}

export default function Navigation({
  currentProfile,
  profiles,
  showProfileSelector,
  setShowProfileSelector,
  onProfileSelect,
  onOpenProfileManager,
  onOpenCreateProfile,
}: NavigationProps) {
  return (
    <nav className="flex items-center justify-between mb-10">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "#FF0055",
            boxShadow: "0 0 16px rgba(255,0,85,0.5), 0 0 32px rgba(255,0,85,0.15)",
          }}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 3.882C4 3.395 4.526 3.1 4.933 3.366l14.312 8.618a.5.5 0 010 .848L4.933 21.35C4.526 21.616 4 21.321 4 20.834V3.882z"/>
          </svg>
        </div>
        <div>
          <h1
            className="font-bebas text-3xl leading-none tracking-[0.05em]"
            style={{ color: "#FF0055", textShadow: "0 0 20px rgba(255,0,85,0.4)" }}
          >
            openWatchlist
          </h1>
          <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase leading-none mt-0.5">
            track together
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Profile selector */}
        <div className="relative">
          <button
            onClick={() => setShowProfileSelector(!showProfileSelector)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all group"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,0,85,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.08)";
            }}
          >
            {currentProfile.imageUrl ? (
              <img src={currentProfile.imageUrl} alt={currentProfile.username}
                className="w-7 h-7 rounded-lg object-cover"
                style={{ boxShadow: "0 0 8px rgba(255,0,85,0.3)" }} />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)" }}
              >
                {currentProfile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-white/80 text-sm font-semibold hidden sm:block max-w-[100px] truncate">
              {currentProfile.username}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-white/30 transition-transform ${showProfileSelector ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProfileSelector && (
            <div
              className="fixed right-4 mt-2 w-64 rounded-2xl shadow-2xl z-50 anim-scale-in flex flex-col"
              style={{
                top: "auto",
                background: "rgba(10, 10, 18, 0.97)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,0,85,0.1)",
                maxHeight: "min(420px, calc(100vh - 80px))",
              }}
            >
              {/* Scrollable profile list */}
              <div className="p-4 pb-0 overflow-y-auto min-h-0 flex-1">
                <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase font-bold mb-3 px-1">
                  Profil wählen
                </p>
                <div className="space-y-1">
                  {profiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => onProfileSelect(profile)}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl transition-all"
                      style={currentProfile.id === profile.id
                        ? { background: "rgba(255,0,85,0.12)", border: "1px solid rgba(255,0,85,0.2)" }
                        : { border: "1px solid transparent" }
                      }
                      onMouseEnter={e => {
                        if (currentProfile.id !== profile.id)
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={e => {
                        if (currentProfile.id !== profile.id)
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      {profile.imageUrl ? (
                        <img src={profile.imageUrl} alt={profile.username} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)" }}
                        >
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-white/80 font-medium flex-1 text-left text-sm truncate">
                        {profile.username}
                      </span>
                      {currentProfile.id === profile.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E57A]"
                          style={{ boxShadow: "0 0 6px rgba(0,229,122,0.6)" }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinned bottom actions — always visible */}
              <div className="p-4 pt-0 flex-shrink-0">
                <div className="pt-3 mt-3 space-y-1"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button onClick={onOpenProfileManager}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-white/35 hover:text-white/70 transition-all text-xs tracking-wide"
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile verwalten
                  </button>
                  <button onClick={onOpenCreateProfile}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all"
                    style={{ color: "#FF0055" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.08)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Neues Profil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
