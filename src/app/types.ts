export type MediaType = "movie" | "tv";

export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  media_type?: string;
}

export interface Profile {
  id: string;
  username: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastSeenAt?: string | null;
}

export interface Message {
  id: string;
  profileId: string;
  content: string;
  createdAt: string;
  profile: Profile;
}

export function formatLastSeen(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return "nie";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

export function getPresenceColor(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return "rgba(255,255,255,0.15)";
  const diffMin = (Date.now() - new Date(lastSeenAt).getTime()) / 60_000;
  if (diffMin < 5) return "#00E57A";
  if (diffMin < 60) return "#FFB300";
  return "rgba(255,255,255,0.15)";
}

export interface MovieUserState {
  id: string;
  movieId: string;
  profileId: string;
  seen: boolean;
  rating: number | null;
  note: string | null;
  seenAt: string | null;
}

export interface Movie {
  id: string;
  title: string;
  addedBy: string | null;
  tmdbId: number;
  posterUrl?: string | null;
  overview?: string | null;
  genres: string;
  createdAt: string;
  mediaType: string;
  streamingProviders?: string;
  profile?: Profile;
  userStates: MovieUserState[];
}

export type SortOption = "date_desc" | "date_asc" | "title_asc" | "title_desc" | "rating_desc";
export type ViewTab = "all" | "watchlist" | "watched";

// Helper functions for per-user state
export function getMyState(movie: Movie, profileId: string): MovieUserState | undefined {
  return movie.userStates?.find(s => s.profileId === profileId);
}

export function getAvgRating(movie: Movie): number | null {
  const rated = movie.userStates?.filter(s => s.rating != null) ?? [];
  if (rated.length === 0) return null;
  return rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length;
}

export function isAllSeen(movie: Movie, profileCount: number): boolean {
  if (profileCount === 0) return false;
  const seenCount = movie.userStates?.filter(s => s.seen).length ?? 0;
  return seenCount >= profileCount;
}
