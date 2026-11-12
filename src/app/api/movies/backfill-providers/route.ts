import { prisma } from "~/lib/db";

const TMDB_REGION = "DE";

async function fetchWatchProviders(tmdbId: number, mediaType: "movie" | "tv") {
  const apiKey = process.env.TMDB_API_KEY;
  const endpoint = mediaType === "tv" ? "tv" : "movie";
  const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/watch/providers?api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return "";

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

export async function POST() {
  const movies = await prisma.movie.findMany();
  let updated = 0;

  for (const movie of movies) {
    if (!movie.tmdbId || (movie.streamingProviders && movie.streamingProviders !== "")) {
      continue;
    }

    const providers = await fetchWatchProviders(
      movie.tmdbId,
      movie.mediaType === "tv" ? "tv" : "movie"
    );

    await prisma.movie.update({
      where: { id: movie.id },
      data: { streamingProviders: providers },
    });

    updated++;
  }

  return Response.json({ updated });
}
