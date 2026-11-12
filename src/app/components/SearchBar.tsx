"use client";

import type { SearchResult } from "../types";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  loadingSearch: boolean;
  searchResults: SearchResult[];
  showManualAdd: boolean;
  manualTitle: string;
  setManualTitle: (title: string) => void;
  loadingAdd: string | null;
  onSearch: () => void;
  onAddMovie: (tmdbId: number, resultMediaType?: string) => void;
  onAddManual: () => void;
}

export default function SearchBar({
  query,
  setQuery,
  loadingSearch,
  searchResults,
  showManualAdd,
  manualTitle,
  setManualTitle,
  loadingAdd,
  onSearch,
  onAddMovie,
  onAddManual,
}: SearchBarProps) {
  return (
    <div className="w-full max-w-3xl mb-8">
      <div className="relative group">
        {/* Glow layer */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
          style={{ background: "radial-gradient(ellipse 80% 120% at 50% 100%, rgba(255,0,85,0.12), transparent)" }}
        />

        {/* Search icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          {loadingSearch ? (
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#FF0055", borderTopColor: "transparent" }}
            />
          ) : (
            <svg className="w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch()}
          placeholder="Film oder Serie suchen..."
          className="w-full rounded-2xl pl-12 pr-36 py-4 text-white placeholder-white/20 text-sm transition-all input-neon"
          style={{
            background: "rgba(14, 14, 24, 0.8)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(12px)",
          }}
        />

        <button
          onClick={onSearch}
          disabled={loadingSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl text-white text-xs font-bold tracking-[0.1em] uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 btn-shimmer"
          style={{
            background: "linear-gradient(135deg, #FF0055, #CC0044)",
            boxShadow: "0 2px 16px rgba(255,0,85,0.35)",
          }}
        >
          {loadingSearch ? "..." : "Suchen"}
        </button>
      </div>

      {/* Results */}
      {(searchResults.length > 0 || showManualAdd) && (
        <div
          className="mt-2 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto anim-fade-up"
          style={{
            background: "rgba(10, 10, 18, 0.98)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,0,85,0.08)",
          }}
        >
          {showManualAdd && searchResults.length === 0 && (
            <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-white/40 text-xs mb-4 tracking-wide">
                Keine Treffer für <span className="text-white font-semibold">"{manualTitle}"</span>
              </p>
              <input
                type="text"
                value={manualTitle}
                onChange={e => setManualTitle(e.target.value)}
                placeholder="Titel bearbeiten..."
                className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 mb-3 transition-all input-neon"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <button
                onClick={onAddManual}
                disabled={loadingAdd === "manual"}
                className="w-full px-4 py-3 text-white text-xs font-bold tracking-[0.1em] uppercase rounded-xl transition-all disabled:opacity-50 btn-shimmer relative"
                style={{
                  background: "linear-gradient(135deg, #FF0055, #CC0044)",
                  boxShadow: "0 2px 16px rgba(255,0,85,0.3)",
                }}
              >
                {loadingAdd === "manual" ? "Wird hinzugefügt..." : "Manuell hinzufügen"}
              </button>
            </div>
          )}

          {searchResults.map(result => {
            const title = result.title || result.name || "Unbekannt";
            const year = result.release_date?.slice(0, 4) || result.first_air_date?.slice(0, 4) || "";
            const type = result.media_type ?? "movie";
            const isLoading = loadingAdd === String(result.id);

            return (
              <div
                key={result.id}
                className="flex items-center gap-4 px-4 py-3 transition-all"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
              >
                {result.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                    alt={title}
                    className="h-[68px] w-[46px] rounded-lg object-cover flex-shrink-0"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                  />
                ) : (
                  <div
                    className="h-[68px] w-[46px] rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    {type === "tv" ? "📺" : "🎬"}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/90 font-semibold text-sm truncate">{title}</span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide flex-shrink-0"
                      style={type === "tv"
                        ? { background: "rgba(0,212,255,0.15)", color: "#00D4FF" }
                        : { background: "rgba(255,0,85,0.15)", color: "#FF0055" }
                      }
                    >
                      {type === "tv" ? "SERIE" : "FILM"}
                    </span>
                  </div>
                  {year && <div className="text-white/25 text-xs">{year}</div>}
                </div>

                <button
                  onClick={() => onAddMovie(result.id, type)}
                  disabled={isLoading}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all disabled:opacity-50 hover:scale-105"
                  style={{
                    background: "rgba(255,0,85,0.12)",
                    border: "1px solid rgba(255,0,85,0.25)",
                    color: "#FF0055",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.22)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,0,85,0.12)"}
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#FF0055", borderTopColor: "transparent" }} />
                  ) : (
                    <>+ Add</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
