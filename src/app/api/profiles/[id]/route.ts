import { prisma } from "~/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { username, imageUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (username !== undefined) updateData.username = username;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const profile = await prisma.profile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Password check
    const body = await request.json().catch(() => ({})) as { password?: string };
    if (body.password !== "erdinc") {
      return NextResponse.json({ error: "Falsches Passwort" }, { status: 403 });
    }

    await prisma.profile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
