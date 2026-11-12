import { prisma } from "~/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, imageUrl } = body;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { username: username.trim() },
    });

    if (existingProfile) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const profile = await prisma.profile.create({
      data: {
        username: username.trim(),
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
