export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json([]);
  }

  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${apiKey}&language=de-DE`;

  const res = await fetch(url);
  const data = await res.json();

  // Filter to only movies and TV shows (exclude people, etc.)
  const results = (data.results || []).filter(
    (r: any) => r.media_type === "movie" || r.media_type === "tv"
  );

  return Response.json(results);
}
