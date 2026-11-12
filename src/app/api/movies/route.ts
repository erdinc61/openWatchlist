import { prisma } from "~/lib/db";
import { moviesCache } from "~/lib/movies";

const TMDB_REGION = "DE";

async function fetchWatchProviders(tmdbId: number, mediaType: "movie" | "tv") {
  const apiKey = process.env.TMDB_API_KEY;
  const endpoint = mediaType === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/watch/providers?api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Watch provider fetch failed:", res.status);
    return "";
  }

  const data = await res.json();
  const regionData = data.results?.[TMDB_REGION];
  if (!regionData) return "";

  const all = [
    ...(regionData.flatrate || []),
    ...(regionData.free || []),
    ...(regionData.ads || []),
  ];

  const ids = Array.from(
      new Set(all.map((p: any) => String(p.provider_id)))
  );

  return ids.join(",");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30"), 100);
  const skip = parseInt(url.searchParams.get("skip") ?? "0");

  // Use cache only for the initial first-page load
  if (skip === 0 && limit === 30) {
    const cached = moviesCache.get();
    if (cached) {
      return Response.json(cached.movies, {
        headers: { "X-Total-Count": String(cached.total) },
      });
    }
  }

  const [total, movies, profiles] = await Promise.all([
    prisma.movie.count(),
    prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.profile.findMany(),
  ]);

  // Only fetch userStates for the movies on this page
  const movieIds = movies.map(m => m.id);
  const userStates = await prisma.movieUserState.findMany({
    where: { movieId: { in: movieIds } },
  });

  const profileMap = new Map(profiles.map(p => [p.id, p]));
  const statesByMovie = new Map<string, typeof userStates>();
  for (const s of userStates) {
    const arr = statesByMovie.get(s.movieId);
    if (arr) arr.push(s);
    else statesByMovie.set(s.movieId, [s]);
  }

  const result = movies.map(m => ({
    ...m,
    profile: m.addedBy ? (() => { const p = profileMap.get(m.addedBy); return p ? { id: p.id, username: p.username } : null; })() : null,
    userStates: statesByMovie.get(m.id) ?? [],
  }));

  if (skip === 0 && limit === 30) {
    moviesCache.set({ movies: result, total });
  }

  return Response.json(result, {
    headers: { "X-Total-Count": String(total) },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { tmdbId, addedBy, mediaType } = body;

  if (!tmdbId) {
    return Response.json({ error: "tmdbId is required" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  const endpoint = mediaType === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    return Response.json({ error: "TMDB fetch failed" }, { status: 500 });
  }

  const data = await response.json();

  const posterUrl = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null;

  const genreString = data.genres
      ? data.genres.map((g: any) => g.name).join(",")
      : "";

  const title = data.title || data.name || "Unbekannt";

  // Fetch watch providers and profile in parallel instead of sequentially
  const [providerString, profile] = await Promise.all([
    fetchWatchProviders(data.id, mediaType === "tv" ? "tv" : "movie"),
    addedBy ? prisma.profile.findUnique({ where: { id: addedBy }, select: { id: true, username: true } }) : Promise.resolve(null),
  ]);

  const saved = await prisma.movie.create({
    data: {
      title,
      tmdbId: data.id,
      addedBy: addedBy || null,
      posterUrl,
      overview: data.overview || "",
      genres: genreString,
      mediaType: mediaType || "movie",
      streamingProviders: providerString,
    },
  });

  moviesCache.clear();

  // Build response directly instead of re-querying the database
  const result = {
    ...saved,
    profile: profile || null,
    userStates: [],
  };
  return Response.json(result);
}
