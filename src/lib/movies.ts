import { prisma } from "~/lib/db";

/** Simple in-memory cache for movies list — invalidated on any write */
const CACHE_TTL = 5 * 60_000; // 5 minutes
let _cache: { data: any; ts: number } | null = null;

export const moviesCache = {
  get() {
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data;
    return null;
  },
  set(data: any) {
    _cache = { data, ts: Date.now() };
  },
  clear() {
    _cache = null;
  },
};

/** Fetch a single movie with profile + userStates (for POST/PATCH responses) */
export async function getMovieWithRelations(movieId: string) {
  const [movie, profiles, userStates] = await Promise.all([
    prisma.movie.findUnique({ where: { id: movieId } }),
    prisma.profile.findMany(),
    prisma.movieUserState.findMany({ where: { movieId } }),
  ]);
  if (!movie) return null;
  const profileMap = new Map(profiles.map(p => [p.id, p]));
  return {
    ...movie,
    profile: movie.addedBy ? profileMap.get(movie.addedBy) ?? null : null,
    userStates,
  };
}
