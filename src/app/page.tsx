"use client";

import { useState, useMemo } from "react";
import type { MediaType, Movie, SearchResult, SortOption, ViewTab } from "./types";
import { getMyState, getAvgRating } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useProfiles } from "./hooks/useProfiles";
import { useMovies } from "./hooks/useMovies";

import LoginScreen from "./components/LoginScreen";
import CreateProfileScreen from "./components/CreateProfileScreen";
import Navigation from "./components/Navigation";
import SearchBar from "./components/SearchBar";
import StatsBar from "./components/StatsBar";
import MoviesGrid from "./components/MoviesGrid";
import LuckyWheel from "./components/LuckyWheel";
import ProfileManager from "./components/ProfileManager";
import CreateProfileModal from "./components/CreateProfileModal";
import SortFilterBar from "./components/SortFilterBar";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import MovieDetailModal from "./components/MovieDetailModal";
import ChatBox from "./components/ChatBox";

export default function HomePage() {
  const auth = useAuth();
  const profilesHook = useProfiles();
  const moviesHook = useMovies();

  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  // Profile filter
  const [selectedProfileFilter, setSelectedProfileFilter] = useState<string | null>(null);

  // Sort/filter/detail
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("date_desc");
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const currentProfileId = profilesHook.currentProfile?.id ?? "";

  // Derived: filtered + sorted movies
  const filteredMovies = useMemo(() => {
    let list = selectedProfileFilter
      ? moviesHook.movies.filter(m => m.addedBy === selectedProfileFilter)
      : moviesHook.movies;

    if (viewTab === "watchlist") {
      list = list.filter(m => !(getMyState(m, currentProfileId)?.seen));
    } else if (viewTab === "watched") {
      list = list.filter(m => getMyState(m, currentProfileId)?.seen);
    }

    if (genreFilter) {
      list = list.filter(m =>
        m.genres.split(",").map(g => g.trim()).includes(genreFilter)
      );
    }

    return [...list].sort((a, b) => {
      switch (sortOption) {
        case "date_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "rating_desc":
          return (getAvgRating(b) ?? 0) - (getAvgRating(a) ?? 0);
        case "date_desc":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [moviesHook.movies, selectedProfileFilter, viewTab, genreFilter, sortOption, currentProfileId]);

  // Keep selectedMovie in sync with latest data
  const syncedSelectedMovie = useMemo(() => {
    if (!selectedMovie) return null;
    return moviesHook.movies.find(m => m.id === selectedMovie.id) ?? null;
  }, [selectedMovie, moviesHook.movies]);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setShowManualAdd(false);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);

      if (data.length === 0) {
        setShowManualAdd(true);
        setManualTitle(query);
      }
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleAddManual() {
    if (!manualTitle.trim() || !profilesHook.currentProfile) return;
    setLoadingAdd("manual");
    try {
      await moviesHook.addManualMovie(manualTitle, profilesHook.currentProfile.id, mediaType);
      setSearchResults([]);
      setQuery("");
      setManualTitle("");
      setShowManualAdd(false);
    } finally {
      setLoadingAdd(null);
    }
  }

  async function handleAddMovie(tmdbId: number, resultMediaType?: string) {
    if (!profilesHook.currentProfile) return;
    setLoadingAdd(String(tmdbId));
    try {
      const typeToAdd = resultMediaType ?? mediaType;
      await moviesHook.addMovie(tmdbId, profilesHook.currentProfile.id, typeToAdd as MediaType);
      setSearchResults([]);
      setQuery("");
    } finally {
      setLoadingAdd(null);
    }
  }

  async function handleCreateProfile() {
    if (!newProfileName.trim()) return;
    await profilesHook.createProfile(newProfileName);
    setNewProfileName("");
    setShowCreateProfile(false);
  }

  function handleProfileSelect(profile: typeof profilesHook.currentProfile) {
    if (profile) {
      profilesHook.setCurrentProfile(profile);
      setShowProfileSelector(false);
    }
  }

  // Login screen
  if (!auth.isAuthenticated) {
    return (
      <LoginScreen
        password={auth.password}
        setPassword={auth.setPassword}
        error={auth.error}
        onSubmit={() => {
          if (auth.handlePasswordSubmit()) {
            profilesHook.loadProfiles();
            moviesHook.loadMovies();
          }
        }}
      />
    );
  }

  // No profile screen
  if (!profilesHook.currentProfile) {
    return (
      <CreateProfileScreen
        newProfileName={newProfileName}
        setNewProfileName={setNewProfileName}
        onCreate={handleCreateProfile}
      />
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      {/* Hero Section */}
      <div className="relative pb-6 overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Navigation
            currentProfile={profilesHook.currentProfile}
            profiles={profilesHook.profiles}
            showProfileSelector={showProfileSelector}
            setShowProfileSelector={setShowProfileSelector}
            onProfileSelect={handleProfileSelect}
            onOpenProfileManager={() => {
              setShowProfileSelector(false);
              setShowProfileManager(true);
            }}
            onOpenCreateProfile={() => {
              setShowProfileSelector(false);
              setShowCreateProfile(true);
            }}
          />

          <SearchBar
            query={query}
            setQuery={setQuery}
            loadingSearch={loadingSearch}
            searchResults={searchResults}
            showManualAdd={showManualAdd}
            manualTitle={manualTitle}
            setManualTitle={setManualTitle}
            loadingAdd={loadingAdd}
            onSearch={handleSearch}
            onAddMovie={handleAddMovie}
            onAddManual={handleAddManual}
          />

          <StatsBar
            movies={moviesHook.movies}
            profiles={profilesHook.profiles}
            selectedProfileFilter={selectedProfileFilter}
            onProfileFilterChange={setSelectedProfileFilter}
            currentProfileId={currentProfileId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <SortFilterBar
          allMovies={moviesHook.movies}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewTab={viewTab}
          onViewTabChange={setViewTab}
          genreFilter={genreFilter}
          onGenreFilterChange={setGenreFilter}
        />

        <MoviesGrid
          movies={filteredMovies}
          onDeleteMovie={moviesHook.deleteMovie}
          onUpdateMovie={moviesHook.updateMovie}
          onMovieClick={setSelectedMovie}
          currentProfileId={currentProfileId}
          profileCount={profilesHook.profiles.length}
          profiles={profilesHook.profiles}
        />

        {/* Load More Button */}
        {moviesHook.hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={moviesHook.loadMore}
              disabled={moviesHook.loadingMore}
              className="px-8 py-3 rounded-xl text-sm font-bold tracking-[0.1em] uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: "rgba(255,0,85,0.15)",
                border: "1px solid rgba(255,0,85,0.3)",
                color: "#FF0055",
              }}
            >
              {moviesHook.loadingMore ? "Laden..." : "Mehr laden"}
            </button>
          </div>
        )}

        <div>
          <button
            onClick={() => setShowStats(prev => !prev)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-[0.1em] uppercase transition-all hover:scale-105 active:scale-95"
            style={showStats
              ? { background: "#FF0055", color: "white", boxShadow: "0 2px 16px rgba(255,0,85,0.35)" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }
            }
          >
            📊 {showStats ? "Statistiken ausblenden" : "Statistiken anzeigen"}
          </button>

          {showStats && (
            <div className="mt-4">
              <AnalyticsDashboard
                movies={moviesHook.movies}
                profiles={profilesHook.profiles}
                currentProfileId={currentProfileId}
              />
            </div>
          )}
        </div>

        <LuckyWheel
          movies={filteredMovies}
          currentProfileId={currentProfileId}
        />
      </div>

      {/* Modals */}
      <ProfileManager
        show={showProfileManager}
        onClose={() => setShowProfileManager(false)}
        profiles={profilesHook.profiles}
        movies={moviesHook.movies}
        onUpdateProfile={profilesHook.updateProfile}
        onDeleteProfile={profilesHook.deleteProfile}
      />

      <CreateProfileModal
        show={showCreateProfile}
        onClose={() => setShowCreateProfile(false)}
        newProfileName={newProfileName}
        setNewProfileName={setNewProfileName}
        onCreate={handleCreateProfile}
      />

      <MovieDetailModal
        movie={syncedSelectedMovie}
        onClose={() => setSelectedMovie(null)}
        onUpdateMovie={moviesHook.updateMovie}
        onDeleteMovie={moviesHook.deleteMovie}
        currentProfileId={currentProfileId}
        profiles={profilesHook.profiles}
      />

      <ChatBox
        currentProfile={profilesHook.currentProfile!}
        profiles={profilesHook.profiles}
        onPresenceRefresh={profilesHook.loadProfiles}
      />
    </div>
  );
}
