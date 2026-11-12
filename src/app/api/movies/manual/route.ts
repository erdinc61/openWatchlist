import { prisma } from "~/lib/db";
import { getMovieWithRelations, moviesCache } from "~/lib/movies";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, addedBy, mediaType } = body;

    if (!title) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }

    const saved = await prisma.movie.create({
      data: {
        title,
        tmdbId: null,
        addedBy: addedBy || null,
        posterUrl: null,
        overview: "Manuell hinzugefügt",
        genres: "",
        mediaType: mediaType || "movie",
      },
    });

    moviesCache.clear();
    const result = await getMovieWithRelations(saved.id);
    return Response.json(result);
  } catch (error) {
    console.error("Error creating manual movie:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
