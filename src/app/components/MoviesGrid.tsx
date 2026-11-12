"use client";

import { useState } from "react";
import Image from "next/image";
import type { Movie, Profile } from "../types";
import { getMyState, getAvgRating, isAllSeen } from "../types";
import PROVIDER_LABELS from "providerLabels.json";
import StarRating from "./StarRating";

interface MoviesGridProps {
  movies: Movie[];
  onDeleteMovie: (movieId: string, profileId: string) => Promise<void>;
  onUpdateMovie: (movieId: string, profileId: string, updates: { seen?: boolean; rating?: number | null }) => Promise<void>;
  onMovieClick: (movie: Movie) => void;
  currentProfileId: string;
  profileCount: number;
  profiles: Profile[];
}

export default function MoviesGrid({ movies, onDeleteMovie, onUpdateMovie: _onUpdateMovie, onMovieClick, currentProfileId, profileCount, profiles }: MoviesGridProps) {
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<string | null>(null);

  function getProvidersForMovie(movie: Movie): string[] {
    if (!movie.streamingProviders) return [];
    return movie.streamingProviders
      .split(",")
      .map(id => id.trim())
      .filter(Boolean)
      .map(id => (PROVIDER_LABELS as Record<string, string>)[id] || `Provider ${id}`);
  }

  async function handleDelete(e: React.MouseEvent, movieId: string) {
    e.stopPropagation();
    setDeletingMovie(movieId);
    try {
      await onDeleteMovie(movieId, currentProfileId);
    } catch {
      // Error handled in hook
    } finally {
      setDeletingMovie(null);
    }
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-24 anim-fade-up">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 text-4xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          🎬
        </div>
        <h3 className="font-bebas text-4xl tracking-wider text-white/50 mb-2">Noch leer</h3>
        <p className="text-white/20 text-xs tracking-widest uppercase">Suche oben nach Filmen oder Serien</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-bebas text-3xl tracking-[0.06em] text-white">Eure Sammlung</h2>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold tracking-widest"
          style={{
            background: "rgba(255,0,85,0.12)",
            border: "1px solid rgba(255,0,85,0.2)",
            color: "#FF0055",
          }}
        >
          {movies.length}
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(255,0,85,0.3), transparent)" }} />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
        {movies.map((movie, idx) => {
          const mySeen = getMyState(movie, currentProfileId)?.seen ?? false;
          const avgRating = getAvgRating(movie);
          const allSeen = isAllSeen(movie, profileCount);
          const canDelete = movie.addedBy === currentProfileId;
          const isHovered = hoveredMovie === movie.id;

          return (
            <div
              key={movie.id}
              onClick={() => onMovieClick(movie)}
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
              className="poster-card relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
              style={{
                background: "#0e0e18",
                outline: allSeen ? `2px solid rgba(255,179,0,0.7)` : undefined,
                boxShadow: allSeen ? "0 0 16px rgba(255,179,0,0.15)" : undefined,
                animationDelay: `${Math.min(idx * 20, 400)}ms`,
              }}
            >
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
                  className="object-cover transition-all duration-500"
                  style={{
                    filter: mySeen ? "brightness(0.5) saturate(0.7)" : "brightness(1)",
                    transform: isHovered ? "scale(1.08)" : "scale(1)",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.parentElement?.querySelector(".poster-fallback") as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                  unoptimized
                />
              ) : null}
              <div
                className="poster-fallback w-full h-full items-center justify-center text-4xl transition-all duration-300"
                style={{
                  display: movie.posterUrl ? "none" : "flex",
                  background: "linear-gradient(135deg, #0a0a14, #141420)",
                  opacity: mySeen ? 0.5 : 1,
                }}
              >
                <div className="text-center px-2">
                  <div className="text-3xl mb-2">{movie.mediaType === "tv" ? "📺" : "🎬"}</div>
                  <p className="text-white/40 text-[10px] font-semibold leading-tight line-clamp-2">{movie.title}</p>
                </div>
              </div>

              {mySeen && (
                <div
                  className="absolute bottom-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#00E57A", boxShadow: "0 0 8px rgba(0,229,122,0.6)" }}
                >
                  <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}

              {allSeen && (
                <div
                  className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#FFB300", boxShadow: "0 0 8px rgba(255,179,0,0.6)" }}
                >
                  <span className="text-black text-xs font-black">★</span>
                </div>
              )}

              <div className="absolute top-2 left-2 z-20">
                <div
                  className="px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-widest"
                  style={movie.mediaType === "tv"
                    ? { background: "rgba(0,212,255,0.85)", color: "#040407" }
                    : { background: "rgba(255,0,85,0.85)", color: "white" }
                  }
                >
                  {movie.mediaType === "tv" ? "TV" : "FILM"}
                </div>
              </div>

              <div className="absolute top-2 right-2 z-20">
                {(() => {
                  const p = movie.addedBy ? profiles.find(pr => pr.id === movie.addedBy) : null;
                  const img = p?.imageUrl || movie.profile?.imageUrl;
                  const name = p?.username || movie.profile?.username;
                  return img ? (
                    <img src={img} alt={name || ""}
                      className="w-7 h-7 rounded-lg object-cover"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)" }} />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF0055, #CC0044)", boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                    >
                      {name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  );
                })()}
              </div>

              <div
                className="absolute inset-0 flex flex-col justify-end transition-all duration-300"
                style={{
                  opacity: isHovered ? 1 : 0,
                  background: "linear-gradient(to top, rgba(4,4,7,0.98) 0%, rgba(4,4,7,0.8) 40%, rgba(4,4,7,0.2) 70%, transparent 100%)",
                }}
              >
                <div className="p-3">
                  <h3 className="text-white font-bold text-xs mb-1.5 line-clamp-2 leading-snug">{movie.title}</h3>

                  {profiles.length > 0 && (() => {
                    const seenP = profiles.filter(p => movie.userStates?.some(s => s.profileId === p.id && s.seen));
                    const unseenP = profiles.filter(p => !movie.userStates?.some(s => s.profileId === p.id && s.seen));
                    return (
                      <div className="flex items-center gap-1 mb-1.5">
                        {seenP.map(p => (
                          <div key={p.id} title={`${p.username} ✓`}>
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.username} className="w-5 h-5 rounded-md object-cover"
                                  style={{ boxShadow: "0 0 6px rgba(0,229,122,0.5)", outline: "1px solid #00E57A" }} />
                              : <div className="w-5 h-5 rounded-md flex items-center justify-center text-black text-[8px] font-bold"
                                  style={{ background: "#00E57A" }}>{p.username.charAt(0).toUpperCase()}</div>
                            }
                          </div>
                        ))}
                        {unseenP.map(p => (
                          <div key={p.id} title={`${p.username} ✗`} style={{ opacity: 0.3 }}>
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.username} className="w-5 h-5 rounded-md object-cover" />
                              : <div className="w-5 h-5 rounded-md flex items-center justify-center text-white/50 text-[8px] font-bold"
                                  style={{ background: "rgba(255,255,255,0.1)" }}>{p.username.charAt(0).toUpperCase()}</div>
                            }
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {movie.genres && (
                    <p className="text-white/35 text-[10px] mb-1.5 line-clamp-1">
                      {movie.genres.split(",").slice(0, 2).join(" · ")}
                    </p>
                  )}

                  {avgRating != null && (
                    <div className="mb-2">
                      <StarRating value={Math.round(avgRating)} readonly size="sm" />
                    </div>
                  )}

                  {getProvidersForMovie(movie).slice(0, 2).map(providerName => (
                    <span
                      key={providerName}
                      className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide"
                      style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                    >
                      {providerName}
                    </span>
                  ))}

                  {canDelete && (
                    <button
                      onClick={e => handleDelete(e, movie.id)}
                      disabled={deletingMovie === movie.id}
                      className="w-full py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all disabled:opacity-50"
                      style={{ background: "rgba(255,0,85,0.8)", color: "white" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,1)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.8)"}
                    >
                      {deletingMovie === movie.id ? "..." : "Löschen"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
