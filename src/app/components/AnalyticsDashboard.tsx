"use client";

import { useState } from "react";
import type { Movie, Profile } from "../types";
import { getMyState, getAvgRating } from "../types";

interface AnalyticsDashboardProps {
  movies: Movie[];
  profiles: Profile[];
  currentProfileId: string;
}

type ChartTab = "genres" | "profiles" | "progress";

const COLORS = ["#FF0055", "#FFB300", "#00D4FF", "#00E57A", "#FF6B00", "#A855F7", "#F43F5E", "#06B6D4"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function AnalyticsDashboard({ movies, profiles, currentProfileId }: AnalyticsDashboardProps) {
  const [tab, setTab] = useState<ChartTab>("genres");

  const mySeenCount = movies.filter(m => getMyState(m, currentProfileId)?.seen).length;
  const ratedMovies = movies.filter(m => getAvgRating(m) != null);
  const overallAvgRating = ratedMovies.length > 0
    ? (ratedMovies.reduce((s, m) => s + (getAvgRating(m) ?? 0), 0) / ratedMovies.length).toFixed(1)
    : "–";

  const genreCount: Record<string, number> = {};
  for (const movie of movies) {
    if (!movie.genres) continue;
    for (const g of movie.genres.split(",").map(s => s.trim()).filter(Boolean)) {
      genreCount[g] = (genreCount[g] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxGenreCount = topGenres[0]?.[1] ?? 1;

  const profileProgress = profiles.map((p, i) => ({
    profile: p,
    seenCount: movies.filter(m => m.userStates?.some(s => s.profileId === p.id && s.seen)).length,
    color: COLORS[i % COLORS.length]!,
  }));

  const profileCounts = profiles.map(p => ({
    profile: p,
    count: movies.filter(m => m.addedBy === p.id).length,
  })).filter(p => p.count > 0);
  const totalProfileCount = profileCounts.reduce((s, p) => s + p.count, 0);

  const circumference = 2 * Math.PI * 80;

  const heroStats = [
    { label: "GESAMT", value: movies.length, color: "#ffffff" },
    { label: "GESEHEN", value: mySeenCount, color: "#00E57A" },
    { label: "OFFEN", value: movies.length - mySeenCount, color: "#FFB300" },
    { label: "Ø STERNE", value: overallAvgRating, color: "#FF0055" },
  ];

  const tabs: { id: ChartTab; label: string }[] = [
    { id: "genres", label: "Genres" },
    { id: "profiles", label: "Profile" },
    { id: "progress", label: "Fortschritt" },
  ];

  return (
    <section className="rounded-2xl p-6 lg:p-8"
      style={{ background: "rgba(10,10,18,0.6)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>

      <div className="flex items-center gap-3 mb-7">
        <div className="flex-1 flex items-center gap-3">
          <h2 className="font-bebas text-3xl tracking-[0.06em] text-white">Statistiken</h2>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,0,85,0.3), transparent)" }} />
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {heroStats.map(stat => (
          <div key={stat.label} className="rounded-xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="font-bebas text-4xl tracking-wider" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[9px] tracking-[0.25em] uppercase font-bold mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 rounded-xl p-1 w-fit"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-5 py-2 rounded-lg text-xs font-bold tracking-[0.1em] uppercase transition-all"
            style={tab === t.id
              ? { background: "#FF0055", color: "white", boxShadow: "0 2px 12px rgba(255,0,85,0.4)" }
              : { color: "rgba(255,255,255,0.25)" }
            }>
            {t.label}
          </button>
        ))}
      </div>

      {/* Genres */}
      {tab === "genres" && (
        <div>
          {topGenres.length === 0
            ? <p className="text-white/20 text-xs text-center py-8 tracking-widest uppercase">Noch keine Daten</p>
            : (
              <svg viewBox="0 0 440 220" className="w-full max-w-lg">
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF0055" />
                    <stop offset="100%" stopColor="#FFB300" />
                  </linearGradient>
                </defs>
                {topGenres.map(([genre, count], i) => {
                  const barWidth = (count / maxGenreCount) * 270;
                  const y = i * 26 + 10;
                  return (
                    <g key={genre}>
                      <text x="0" y={y + 14} fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="600" fontFamily="sans-serif">
                        {genre.length > 14 ? genre.slice(0, 13) + "…" : genre}
                      </text>
                      <rect x="125" y={y + 3} width={barWidth} height="14" rx="3" fill="url(#barG)" opacity="0.8" />
                      <text x={130 + barWidth} y={y + 14} fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                        {count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
        </div>
      )}

      {/* Profiles */}
      {tab === "profiles" && (
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {profileCounts.length === 0
            ? <p className="text-white/20 text-xs text-center py-8 tracking-widest uppercase">Noch keine Daten</p>
            : (
              <>
                <svg viewBox="0 0 220 220" className="w-44 h-44 flex-shrink-0">
                  <defs>
                    {profileCounts.map((_, i) => (
                      <linearGradient key={i} id={`dg${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={COLORS[(i + 1) % COLORS.length]} stopOpacity="0.6" />
                      </linearGradient>
                    ))}
                  </defs>
                  {(() => {
                    let startAngle = 0;
                    return profileCounts.map((p, i) => {
                      const angle = (p.count / totalProfileCount) * 360;
                      const endAngle = startAngle + angle - 1;
                      const path = describeArc(110, 110, 80, startAngle, endAngle);
                      startAngle += angle;
                      return (
                        <path key={p.profile.id} d={path} fill="none"
                          stroke={`url(#dg${i})`} strokeWidth="26" strokeLinecap="round" />
                      );
                    });
                  })()}
                  <text x="110" y="106" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="sans-serif">
                    {totalProfileCount}
                  </text>
                  <text x="110" y="122" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="sans-serif">
                    GESAMT
                  </text>
                </svg>
                <div className="space-y-2.5">
                  {profileCounts.map((p, i) => (
                    <div key={p.profile.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60 text-sm font-semibold">{p.profile.username}</span>
                      <span className="text-white/25 text-xs">{p.count} Titel</span>
                      <span className="text-white/15 text-xs">({Math.round((p.count / totalProfileCount) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>
      )}

      {/* Progress */}
      {tab === "progress" && (
        <div className="flex flex-wrap justify-center gap-8">
          {profileProgress.map(pp => {
            const ratio = movies.length > 0 ? pp.seenCount / movies.length : 0;
            const dashOffset = circumference * (1 - ratio);
            const isCurrent = pp.profile.id === currentProfileId;
            return (
              <div key={pp.profile.id} className="text-center">
                <svg viewBox="0 0 180 180" className="w-36 h-36">
                  <defs>
                    <linearGradient id={`pg-${pp.profile.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={pp.color} />
                      <stop offset="100%" stopColor={pp.color} stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                  <circle cx="90" cy="90" r="80" fill="none" stroke={`url(#pg-${pp.profile.id})`}
                    strokeWidth="14" strokeLinecap="round" strokeDasharray={circumference}
                    strokeDashoffset={dashOffset} transform="rotate(-90 90 90)" />
                  <text x="90" y="84" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="sans-serif">
                    {pp.seenCount}
                  </text>
                  <text x="90" y="100" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="sans-serif">
                    von {movies.length}
                  </text>
                  <text x="90" y="116" textAnchor="middle" fill={pp.color} fontSize="11" fontWeight="700" fontFamily="sans-serif">
                    {movies.length > 0 ? Math.round(ratio * 100) : 0}%
                  </text>
                </svg>
                <p className="text-xs font-bold mt-1" style={{ color: isCurrent ? "white" : "rgba(255,255,255,0.3)" }}>
                  {pp.profile.username} {isCurrent ? "(Du)" : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
