import { prisma } from "~/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { profile: true },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, content } = body;

    if (!profileId || !content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 500) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { profileId, content: trimmed },
      include: { profile: true },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
