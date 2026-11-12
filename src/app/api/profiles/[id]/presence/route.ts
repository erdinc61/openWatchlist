import { prisma } from "~/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.profile.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating presence:", error);
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
  }
}
