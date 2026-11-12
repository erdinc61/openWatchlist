"use client";

import { useState, useEffect, useRef } from "react";
import type { Movie, MediaType } from "../types";

const PAGE_SIZE = 30;

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const skipRef = useRef(0);
  const totalRef = useRef(0);

  useEffect(() => {
    loadMovies().catch(console.error);
  }, []);

  async function loadMovies() {
    try {
      skipRef.current = 0;
      const res = await fetch(`/api/movies?limit=${PAGE_SIZE}&skip=0`);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const total = parseInt(res.headers.get("X-Total-Count") ?? "0");
      const data = await res.json();
      if (!Array.isArray(data)) { setMovies([]); return; }
      totalRef.current = total;
      skipRef.current = data.length;
      setMovies(data);
      setHasMore(data.length < total);
    } catch (error) {
      console.error("Error loading movies:", error);
      setMovies([]);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/movies?limit=${PAGE_SIZE}&skip=${skipRef.current}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const total = parseInt(res.headers.get("X-Total-Count") ?? "0");
      const data = await res.json();
      if (!Array.isArray(data)) return;
      totalRef.current = total;
      skipRef.current += data.length;
      setMovies(prev => [...prev, ...data]);
      setHasMore(skipRef.current < total);
    } catch (error) {
      console.error("Error loading more movies:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  async function addMovie(tmdbId: number, addedBy: string, mediaType: MediaType) {
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, addedBy, mediaType }),
      });
      if (!res.ok) throw new Error("Failed to add movie");
      const saved = await res.json();
      setMovies(prev => [saved, ...prev]);
      totalRef.current += 1;
      return saved;
    } catch (error) {
      console.error("Error adding movie:", error);
      throw error;
    }
  }

  async function addManualMovie(title: string, addedBy: string, mediaType: MediaType) {
    try {
      const res = await fetch("/api/movies/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, addedBy, mediaType }),
      });
      const saved = await res.json();
      setMovies(prev => [saved, ...prev]);
      totalRef.current += 1;
      return saved;
    } catch (error) {
      console.error("Error adding manual movie:", error);
      throw error;
    }
  }

  async function deleteMovie(movieId: string, profileId: string) {
    // Optimistic: remove from UI immediately
    const previousMovies = movies;
    setMovies(prev => prev.filter(m => m.id !== movieId));
    totalRef.current -= 1;

    try {
      const res = await fetch(`/api/movies/${movieId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      if (!res.ok) {
        const data = await res.json();
        // Revert on failure
        setMovies(previousMovies);
        totalRef.current += 1;
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      throw error;
    }
  }

  async function updateMovie(movieId: string, profileId: string, updates: { seen?: boolean; rating?: number | null; note?: string | null }) {
    // Optimistic update of userStates
    setMovies(prev =>
      prev.map(m => {
        if (m.id !== movieId) return m;
        const existingIdx = m.userStates.findIndex(s => s.profileId === profileId);
        const newStates = [...m.userStates];
        if (existingIdx >= 0) {
          newStates[existingIdx] = { ...newStates[existingIdx]!, ...updates };
        } else {
          newStates.push({
            id: "optimistic",
            movieId,
            profileId,
            seen: updates.seen ?? false,
            rating: updates.rating ?? null,
            note: updates.note ?? null,
            seenAt: updates.seen ? new Date().toISOString() : null,
          });
        }
        return { ...m, userStates: newStates };
      })
    );

    try {
      const res = await fetch(`/api/movies/${movieId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, ...updates }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      const updated = await res.json();
      setMovies(prev => prev.map(m => (m.id === movieId ? updated : m)));
    } catch (error) {
      console.error("Error updating movie:", error);
      await loadMovies();
    }
  }

  return {
    movies,
    hasMore,
    loadingMore,
    loadMovies,
    loadMore,
    addMovie,
    addManualMovie,
    deleteMovie,
    updateMovie,
  };
}
