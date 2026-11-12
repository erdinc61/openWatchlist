"use client";

import { useState, useEffect } from "react";
import type { Movie, Profile } from "../types";
import { getMyState, getAvgRating, isAllSeen } from "../types";
import StarRating from "./StarRating";
import PROVIDER_LABELS from "providerLabels.json";

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onUpdateMovie: (movieId: string, profileId: string, updates: { seen?: boolean; rating?: number | null; note?: string | null }) => Promise<void>;
  onDeleteMovie: (movieId: string, profileId: string) => Promise<void>;
  currentProfileId: string;
  profiles: Profile[];
}

export default function MovieDetailModal({
  movie, onClose, onUpdateMovie, onDeleteMovie, currentProfileId, profiles,
}: MovieDetailModalProps) {
  const [justMarked, setJustMarked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [noteValue, setNoteValue] = useState("");

  useEffect(() => {
    setJustMarked(false);
    if (movie) setNoteValue(getMyState(movie, currentProfileId)?.note ?? "");
  }, [movie?.id, currentProfileId]);

  useEffect(() => {
    if (movie) setNoteValue(getMyState(movie, currentProfileId)?.note ?? "");
  }, [movie?.userStates, currentProfileId]);

  if (!movie) return null;

  const myState = getMyState(movie, currentProfileId);
  const mySeen = myState?.seen ?? false;
  const myRating = myState?.rating ?? null;
  const avgRating = getAvgRating(movie);
  const allSeen = isAllSeen(movie, profiles.length);
  const canDelete = movie.addedBy === currentProfileId;
  const seenByProfiles = profiles.filter(p => movie.userStates?.some(s => s.profileId === p.id && s.seen));

  function getProviders(): string[] {
    if (!movie?.streamingProviders) return [];
    return movie.streamingProviders.split(",").map(id => id.trim()).filter(Boolean)
      .map(id => (PROVIDER_LABELS as Record<string, string>)[id] ?? `Provider ${id}`);
  }

  function getGenres(): string[] {
    if (!movie?.genres) return [];
    return movie.genres.split(",").map(g => g.trim()).filter(Boolean);
  }

  async function handleSeenToggle() {
    const newSeen = !mySeen;
    await onUpdateMovie(movie!.id, currentProfileId, { seen: newSeen });
    if (newSeen) { setJustMarked(true); setTimeout(() => setJustMarked(false), 1500); }
  }

  async function handleRating(rating: number | null) {
    await onUpdateMovie(movie!.id, currentProfileId, { rating });
  }

  async function handleNoteSave() {
    const currentNote = myState?.note ?? "";
    if (noteValue !== currentNote)
      await onUpdateMovie(movie!.id, currentProfileId, { note: noteValue || null });
  }

  async function handleDelete() {
    setDeleting(true);
    try { await onDeleteMovie(movie!.id, currentProfileId); onClose(); }
    catch { /* handled */ }
    finally { setDeleting(false); }
  }

  const providers = getProviders();
  const genres = getGenres();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(4,4,7,0.92)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl anim-scale-in"
        style={{
          background: "#0a0a12",
          border: allSeen ? "1px solid rgba(255,179,0,0.3)" : "1px solid rgba(255,255,255,0.09)",
          boxShadow: allSeen
            ? "0 0 0 1px rgba(255,179,0,0.1), 0 30px 80px rgba(0,0,0,0.9)"
            : "0 0 0 1px rgba(255,0,85,0.08), 0 30px 80px rgba(0,0,0,0.9)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cinematic backdrop blur */}
        {movie.posterUrl && (
          <>
            <div className="absolute inset-x-0 top-0 h-48 pointer-events-none overflow-hidden rounded-t-2xl">
              <img src={movie.posterUrl} alt="" className="w-full h-full object-cover scale-110 opacity-20"
                style={{ filter: "blur(24px) saturate(0.6)" }} />
            </div>
            <div className="absolute inset-x-0 top-0 h-48 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent 0%, #0a0a12 100%)" }} />
          </>
        )}

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative flex flex-col sm:flex-row gap-0">
          {/* Poster */}
          <div className="sm:w-52 flex-shrink-0 p-5 pb-0 sm:pb-5 sm:pr-0">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title}
                className="w-28 sm:w-full rounded-xl object-cover"
                style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }} />
            ) : (
              <div className="w-28 sm:w-full aspect-[2/3] rounded-xl flex items-center justify-center text-5xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {movie.mediaType === "tv" ? "📺" : "🎬"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4 min-w-0">
            {/* Badges + title */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase"
                  style={movie.mediaType === "tv"
                    ? { background: "rgba(0,212,255,0.15)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }
                    : { background: "rgba(255,0,85,0.15)", color: "#FF0055", border: "1px solid rgba(255,0,85,0.2)" }
                  }>
                  {movie.mediaType === "tv" ? "Serie" : "Film"}
                </span>
                {mySeen && (
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase"
                    style={{ background: "rgba(0,229,122,0.15)", color: "#00E57A", border: "1px solid rgba(0,229,122,0.2)" }}>
                    ✓ Gesehen
                  </span>
                )}
                {allSeen && (
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase"
                    style={{ background: "rgba(255,179,0,0.2)", color: "#FFB300", border: "1px solid rgba(255,179,0,0.3)" }}>
                    ★ Alle gesehen
                  </span>
                )}
              </div>
              <h2 className="font-bebas text-4xl tracking-[0.04em] text-white leading-none">{movie.title}</h2>
            </div>

            {movie.overview && (
              <p className="text-white/35 text-sm leading-relaxed line-clamp-4">{movie.overview}</p>
            )}

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.map(g => (
                  <span key={g} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                    {g}
                  </span>
                ))}
              </div>
            )}

            {providers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {providers.map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-widest uppercase"
                    style={{ background: "rgba(255,0,85,0.1)", border: "1px solid rgba(255,0,85,0.2)", color: "rgba(255,0,85,0.8)" }}>
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Added + seen by */}
            <div className="flex items-center gap-4 flex-wrap">
              {movie.profile && (
                <div className="flex items-center gap-2">
                  <span className="text-white/20 text-[9px] tracking-widest uppercase">von</span>
                  {movie.profile.imageUrl
                    ? <img src={movie.profile.imageUrl} alt={movie.profile.username} className="w-5 h-5 rounded-md object-cover" />
                    : <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: "#FF0055" }}>{movie.profile.username.charAt(0).toUpperCase()}</div>
                  }
                  <span className="text-white/50 text-xs font-semibold">{movie.profile.username}</span>
                </div>
              )}
              {seenByProfiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-white/20 text-[9px] tracking-widest uppercase">gesehen von</span>
                  <div className="flex -space-x-1.5">
                    {seenByProfiles.map(p => (
                      p.imageUrl
                        ? <img key={p.id} src={p.imageUrl} alt={p.username} title={p.username}
                            className="w-5 h-5 rounded-md object-cover ring-1 ring-[#0a0a12]" />
                        : <div key={p.id} title={p.username}
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold ring-1 ring-[#0a0a12]"
                            style={{ background: "#00E57A", color: "black" }}>{p.username.charAt(0).toUpperCase()}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-white/25 text-[9px] tracking-[0.2em] uppercase w-28">Deine Bewertung</span>
                  <StarRating value={myRating} onChange={handleRating} size="lg" />
                </div>
                {avgRating !== null && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/25 text-[9px] tracking-[0.2em] uppercase w-28">Durchschnitt</span>
                    <StarRating value={Math.round(avgRating)} readonly size="md" />
                    <span className="text-white/20 text-xs">{avgRating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {movie.userStates?.filter(s => s.note && s.profileId !== currentProfileId).map(s => {
                  const np = profiles.find(p => p.id === s.profileId);
                  if (!np) return null;
                  return (
                    <div key={s.id} className="flex gap-2 items-start">
                      {np.imageUrl
                        ? <img src={np.imageUrl} alt={np.username} className="w-5 h-5 rounded-md object-cover mt-0.5 flex-shrink-0" />
                        : <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white mt-0.5 flex-shrink-0"
                            style={{ background: "#FF0055" }}>{np.username.charAt(0).toUpperCase()}</div>
                      }
                      <div className="rounded-xl px-3 py-2 flex-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span className="text-white/25 text-[9px] font-bold tracking-widest uppercase">{np.username}</span>
                        <p className="text-white/60 text-sm mt-0.5">{s.note}</p>
                      </div>
                    </div>
                  );
                })}
                <textarea
                  value={noteValue}
                  onChange={e => setNoteValue(e.target.value)}
                  onBlur={handleNoteSave}
                  placeholder="Deine Notiz..."
                  className="w-full rounded-xl px-4 py-3 text-white/60 text-sm resize-none transition-all input-neon"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={handleSeenToggle}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
                  style={mySeen
                    ? { background: "#00E57A", color: "black", boxShadow: "0 4px 16px rgba(0,229,122,0.3)" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }
                  }
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {justMarked ? "Gespeichert!" : mySeen ? "Gesehen" : "Als gesehen markieren"}
                </button>

                {canDelete && (
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: "rgba(255,0,85,0.1)", border: "1px solid rgba(255,0,85,0.2)", color: "#FF0055" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.2)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.1)"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deleting ? "..." : "Löschen"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
