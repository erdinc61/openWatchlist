"use client";

import type { Movie, Profile } from "../types";
import { getMyState } from "../types";

interface StatsBarProps {
  movies: Movie[];
  profiles: Profile[];
  selectedProfileFilter: string | null;
  onProfileFilterChange: (profileId: string | null) => void;
  currentProfileId: string;
}

export default function StatsBar({
  movies,
  profiles,
  selectedProfileFilter,
  onProfileFilterChange,
  currentProfileId,
}: StatsBarProps) {
  const allMovies = movies.filter(m => m.mediaType === "movie");
  const allSeries = movies.filter(m => m.mediaType === "tv");
  const mySeenCount = movies.filter(m => getMyState(m, currentProfileId)?.seen).length;

  return (
    <div className="space-y-4 mb-2">
      {/* Stats row */}
      <div className="flex items-center gap-6 flex-wrap">
        {[
          { label: "GESAMT", value: movies.length, color: "rgba(255,255,255,0.8)" },
          { label: "FILME", value: allMovies.length, color: "#FF0055" },
          { label: "SERIEN", value: allSeries.length, color: "#00D4FF" },
          { label: "GESEHEN", value: mySeenCount, color: "#00E57A" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-2">
            {i > 0 && <div className="w-px h-3 opacity-20" style={{ background: "white" }} />}
            <span className="text-white/25 text-[9px] tracking-[0.25em] font-bold">{stat.label}</span>
            <span className="font-bebas text-xl leading-none tracking-wide" style={{ color: stat.color }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Profile filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white/20 text-[9px] tracking-[0.25em] font-bold">FILTER</span>
        <button
          onClick={() => onProfileFilterChange(null)}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
          style={selectedProfileFilter === null
            ? { background: "#FF0055", color: "white", boxShadow: "0 2px 12px rgba(255,0,85,0.35)" }
            : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }
          }
        >
          Alle
        </button>
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => onProfileFilterChange(profile.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all"
            style={selectedProfileFilter === profile.id
              ? { background: "#FF0055", color: "white", boxShadow: "0 2px 12px rgba(255,0,85,0.35)" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }
            }
          >
            {profile.imageUrl
              ? <img src={profile.imageUrl} alt={profile.username} className="w-3.5 h-3.5 rounded-md object-cover" />
              : <div className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[7px] font-bold"
                  style={{ background: "rgba(255,0,85,0.5)", color: "white" }}>
                  {profile.username.charAt(0).toUpperCase()}
                </div>
            }
            {profile.username}
          </button>
        ))}
      </div>
    </div>
  );
}
