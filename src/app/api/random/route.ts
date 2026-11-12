import { prisma } from "~/lib/db";

export async function GET() {
  const movies = await prisma.movie.findMany();

  if (movies.length === 0) {
    return Response.json({ error: "no movies" });
  }

  const random = movies[Math.floor(Math.random() * movies.length)];

  return Response.json(random);
}
