import { prisma } from "~/lib/db";
import { getMovieWithRelations, moviesCache } from "~/lib/movies";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  try {
    const body = await req.json().catch(() => ({})) as { profileId?: string };

    // Ownership check
    if (body.profileId) {
      const movie = await prisma.movie.findUnique({ where: { id } });
      if (movie && movie.addedBy !== body.profileId) {
        return Response.json(
          { error: "Nur die Person, die den Film hinzugefügt hat, kann ihn löschen" },
          { status: 403 }
        );
      }
    }

    await prisma.movie.delete({
      where: { id },
    });

    moviesCache.clear();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return Response.json(
      { error: "Could not delete movie" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  try {
    const body = await req.json() as {
      profileId: string;
      seen?: boolean;
      rating?: number | null;
      note?: string | null;
    };

    if (!body.profileId) {
      return Response.json({ error: "profileId is required" }, { status: 400 });
    }

    const data: { seen?: boolean; rating?: number | null; note?: string | null; seenAt?: Date | null } = {};
    if (typeof body.seen === "boolean") {
      data.seen = body.seen;
      data.seenAt = body.seen ? new Date() : null;
    }
    if ("rating" in body) data.rating = body.rating;
    if ("note" in body) data.note = body.note;

    await prisma.movieUserState.upsert({
      where: {
        movieId_profileId: { movieId: id, profileId: body.profileId },
      },
      create: {
        movieId: id,
        profileId: body.profileId,
        ...data,
      },
      update: data,
    });

    moviesCache.clear();
    const updated = await getMovieWithRelations(id);
    return Response.json(updated);
  } catch (error) {
    console.error("Error updating movie:", error);
    return Response.json(
      { error: "Could not update movie" },
      { status: 500 }
    );
  }
}
