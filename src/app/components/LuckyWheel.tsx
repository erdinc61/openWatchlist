"use client";

import { useState } from "react";
import type { Movie, MediaType } from "../types";
import { getMyState, getAvgRating } from "../types";
import StarRating from "./StarRating";

interface LuckyWheelProps {
  movies: Movie[];
  currentProfileId: string;
}

export default function LuckyWheel({ movies, currentProfileId }: LuckyWheelProps) {
  const [wheelMediaType, setWheelMediaType] = useState<MediaType>("movie");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [seenFilter, setSeenFilter] = useState(true);

  const wheelFilteredMovies = movies.filter(
    m => m.mediaType === wheelMediaType && (!seenFilter || !(getMyState(m, currentProfileId)?.seen))
  );

  async function spin() {
    if (wheelFilteredMovies.length === 0 || spinning) return;
    setSpinning(true);
    setSelectedMovie(null);
    let steps = 24;
    const interval = setInterval(() => {
      const random = wheelFilteredMovies[Math.floor(Math.random() * wheelFilteredMovies.length)];
      setSelectedMovie(random!);
      steps -= 1;
      if (steps <= 0) { clearInterval(interval); setSpinning(false); }
    }, 72);
  }

  if (movies.length === 0) return null;

  return (
    <section className="relative">
      {/* Ambient */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,0,85,0.05), transparent)" }} />

      <div className="relative rounded-3xl p-6 lg:p-10"
        style={{ background: "rgba(10,10,18,0.6)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-bebas text-5xl tracking-[0.06em] mb-1"
            style={{ color: "#FF0055", textShadow: "0 0 20px rgba(255,0,85,0.3)" }}>
            Glücksrad
          </h2>
          <p className="text-white/20 text-xs tracking-widest uppercase">Was schaut ihr heute Abend?</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Media toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["movie", "tv"] as MediaType[]).map(type => (
              <button key={type}
                onClick={() => setWheelMediaType(type)}
                className="px-6 py-2 rounded-lg text-xs font-bold tracking-[0.1em] uppercase transition-all"
                style={wheelMediaType === type
                  ? type === "movie"
                    ? { background: "#FF0055", color: "white", boxShadow: "0 2px 12px rgba(255,0,85,0.4)" }
                    : { background: "#00D4FF", color: "#040407", boxShadow: "0 2px 12px rgba(0,212,255,0.4)" }
                  : { color: "rgba(255,255,255,0.3)" }
                }
              >
                {type === "movie" ? "Filme" : "Serien"}
              </button>
            ))}
          </div>

          {/* Seen filter */}
          <button
            onClick={() => setSeenFilter(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
            style={seenFilter
              ? { background: "rgba(0,229,122,0.12)", border: "1px solid rgba(0,229,122,0.25)", color: "#00E57A" }
              : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }
            }
          >
            <div className={`w-3 h-3 rounded-full border-2 transition-all ${seenFilter ? "bg-[#00E57A] border-[#00E57A]" : "border-white/20"}`} />
            Nur ungesehene
          </button>

          <p className="text-white/20 text-xs tracking-widest">
            <span className="text-white/60 font-bold">{wheelFilteredMovies.length}</span>{" "}
            {wheelMediaType === "movie" ? "Filme" : "Serien"} verfügbar
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Wheel */}
          <div className="relative flex-shrink-0">
            {/* Pointer */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[22px] border-l-transparent border-r-transparent"
                style={{ borderBottomColor: "#FF0055", filter: "drop-shadow(0 0 6px rgba(255,0,85,0.6))" }} />
            </div>

            {/* Ring */}
            <div
              className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-full p-[2px]"
              style={{
                background: "conic-gradient(from 0deg, #FF0055, #FF4488, #FFB300, #FF0055)",
                boxShadow: spinning
                  ? "0 0 40px rgba(255,0,85,0.5), 0 0 80px rgba(255,0,85,0.2)"
                  : selectedMovie
                  ? "0 0 30px rgba(255,0,85,0.35), 0 0 60px rgba(255,0,85,0.1)"
                  : "0 0 20px rgba(255,0,85,0.2)",
                animation: spinning ? "spin 0.6s linear infinite" : undefined,
              }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: "#06060e" }}>
                <div className="text-center px-6">
                  {selectedMovie ? (
                    <div style={{ animation: !spinning ? "fadeUp 0.3s ease forwards" : undefined }}>
                      <div className="text-[9px] uppercase tracking-[0.3em] mb-3 font-bold"
                        style={{ color: "#FF0055" }}>
                        {selectedMovie.mediaType === "tv" ? "Serie des Abends" : "Film des Abends"}
                      </div>
                      {selectedMovie.posterUrl && (
                        <img src={selectedMovie.posterUrl} alt={selectedMovie.title}
                          className="w-20 h-[120px] object-cover rounded-lg mx-auto mb-3"
                          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.7)" }} />
                      )}
                      <div className="text-white font-bold text-xs mb-1 line-clamp-2 leading-snug">
                        {selectedMovie.title}
                      </div>
                      <div className="text-[9px] text-white/30">
                        von <span className="text-white/60">{selectedMovie.profile?.username || "?"}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-5xl mb-3 anim-float">🎲</div>
                      <div className="text-white/25 text-xs tracking-widest uppercase">Bereit</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="text-center lg:text-left space-y-5">
            <button
              onClick={spin}
              disabled={spinning || wheelFilteredMovies.length === 0}
              className="relative px-12 py-5 text-white font-bebas text-3xl tracking-[0.1em] rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 btn-shimmer"
              style={{
                background: "linear-gradient(135deg, #FF0055 0%, #CC0033 100%)",
                boxShadow: spinning ? "none" : "0 8px 30px rgba(255,0,85,0.4), 0 0 60px rgba(255,0,85,0.15)",
              }}
            >
              {spinning ? "DREHT..." : wheelFilteredMovies.length === 0 ? "KEINE INHALTE" : "RAD DREHEN"}
            </button>

            {selectedMovie && !spinning && (
              <div
                className="rounded-2xl p-5 max-w-sm anim-fade-up"
                style={{
                  background: "rgba(255,0,85,0.06)",
                  border: "1px solid rgba(255,0,85,0.15)",
                }}
              >
                <p className="font-bebas text-xl tracking-wider mb-2" style={{ color: "#FF0055" }}>
                  {selectedMovie.mediaType === "tv" ? "Serie ausgewählt!" : "Film ausgewählt!"}
                </p>
                {getAvgRating(selectedMovie) != null && (
                  <div className="mb-2">
                    <StarRating value={Math.round(getAvgRating(selectedMovie)!)} readonly size="sm" />
                  </div>
                )}
                <p className="text-white/30 text-sm leading-relaxed">
                  {selectedMovie.overview
                    ? selectedMovie.overview.slice(0, 140) + "..."
                    : "Macht es euch gemütlich! 🍿"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
