"use client";

import type { Movie, SortOption, ViewTab } from "../types";

interface SortFilterBarProps {
  allMovies: Movie[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  viewTab: ViewTab;
  onViewTabChange: (tab: ViewTab) => void;
  genreFilter: string | null;
  onGenreFilterChange: (genre: string | null) => void;
}

export default function SortFilterBar({
  allMovies,
  sortOption,
  onSortChange,
  viewTab,
  onViewTabChange,
  genreFilter,
  onGenreFilterChange,
}: SortFilterBarProps) {
  const genreCount: Record<string, number> = {};
  for (const movie of allMovies) {
    if (!movie.genres) continue;
    for (const g of movie.genres.split(",").map(s => s.trim()).filter(Boolean)) {
      genreCount[g] = (genreCount[g] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([g]) => g);

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "all", label: "Alle" },
    { id: "watchlist", label: "Watchlist" },
    { id: "watched", label: "Gesehen" },
  ];

  const sortLabels: Record<SortOption, string> = {
    date_desc: "Neueste zuerst",
    date_asc: "Älteste zuerst",
    title_asc: "Titel A–Z",
    title_desc: "Titel Z–A",
    rating_desc: "Beste Bewertung",
  };

  return (
    <div className="space-y-3">
      {/* Tabs + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* View tabs */}
        <div
          className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onViewTabChange(tab.id)}
              className="px-5 py-2 rounded-lg text-xs font-bold tracking-[0.1em] uppercase transition-all"
              style={viewTab === tab.id
                ? { background: "#FF0055", color: "white", boxShadow: "0 2px 12px rgba(255,0,85,0.4)" }
                : { color: "rgba(255,255,255,0.3)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <select
          value={sortOption}
          onChange={e => onSortChange(e.target.value as SortOption)}
          className="text-xs font-bold tracking-wide rounded-xl px-4 py-2.5 transition-all cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.5)",
            WebkitAppearance: "none",
          }}
        >
          {(Object.keys(sortLabels) as SortOption[]).map(key => (
            <option key={key} value={key} className="bg-[#0a0a12]">{sortLabels[key]}</option>
          ))}
        </select>
      </div>

      {/* Genre filters */}
      {topGenres.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/20 text-[9px] tracking-[0.25em] font-bold">GENRE</span>
          {genreFilter && (
            <button
              onClick={() => onGenreFilterChange(null)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              ✕ Reset
            </button>
          )}
          {topGenres.map(genre => (
            <button
              key={genre}
              onClick={() => onGenreFilterChange(genreFilter === genre ? null : genre)}
              className="px-3 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition-all"
              style={genreFilter === genre
                ? { background: "rgba(255,179,0,0.2)", color: "#FFB300", border: "1px solid rgba(255,179,0,0.35)", boxShadow: "0 0 10px rgba(255,179,0,0.1)" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }
              }
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
