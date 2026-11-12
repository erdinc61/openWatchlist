// One-time migration: convert Movie.seen/rating to MovieUserState rows
// Run BEFORE removing seen/rating columns from Movie

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // We need to query with raw SQL since the new schema may not have seen/rating fields
  const movies = await prisma.$queryRaw<Array<{
    id: string;
    addedBy: string | null;
    seen: number; // SQLite stores boolean as 0/1
    rating: number | null;
  }>>`SELECT id, addedBy, seen, rating FROM Movie WHERE (seen = 1 OR rating IS NOT NULL) AND addedBy IS NOT NULL`;

  console.log(`Found ${movies.length} movies with seen/rating data to migrate`);

  for (const movie of movies) {
    if (!movie.addedBy) continue;

    try {
      await prisma.movieUserState.upsert({
        where: {
          movieId_profileId: { movieId: movie.id, profileId: movie.addedBy },
        },
        create: {
          movieId: movie.id,
          profileId: movie.addedBy,
          seen: movie.seen === 1,
          rating: movie.rating,
          seenAt: movie.seen === 1 ? new Date() : null,
        },
        update: {
          seen: movie.seen === 1,
          rating: movie.rating,
          seenAt: movie.seen === 1 ? new Date() : null,
        },
      });
      console.log(`Migrated movie ${movie.id}`);
    } catch (e) {
      console.error(`Error migrating movie ${movie.id}:`, e);
    }
  }

  console.log("Migration complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
