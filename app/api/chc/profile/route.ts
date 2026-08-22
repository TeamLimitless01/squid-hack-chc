import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id?: string; role?: string; profileId?: string }
    | undefined;
  if (!user || user.role !== "chc" || !user.id || !user.profileId) return null;
  return user as { id: string; role: string; profileId: string };
}

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  location: true,
  profileImage: true,
  createdAt: true,
  chcProfile: {
    select: {
      id: true,
      centerName: true,
      verificationStatus: true,
      rating: true,
    },
  },
} as const;

export async function GET() {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: profileSelect,
  });

  if (!profile?.chcProfile) {
    return NextResponse.json(
      { error: "CHC profile not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone || "").trim();
    const centerName = String(body.centerName || "").trim();
    const address = String(body.address || "").trim() || null;
    const city = String(body.city || "").trim() || null;
    const state = String(body.state || "").trim() || null;
    const location =
      body.location && typeof body.location === "object" ? body.location : null;

    if (!name || !email || !phone || !centerName) {
      return NextResponse.json(
        { error: "Name, email, phone, and centre name are required" },
        { status: 400 },
      );
    }

    const profile = await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: user.id },
        data: { name, email, phone, address, city, state, location },
      });
      await transaction.cHCProfile.update({
        where: { id: user.profileId },
        data: { centerName },
      });
      return transaction.user.findUnique({
        where: { id: user.id },
        select: profileSelect,
      });
    });

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (errorCode === "P2002") {
      return NextResponse.json(
        { error: "That email or phone number is already in use" },
        { status: 409 },
      );
    }
    console.error("CHC profile update error:", error);
    return NextResponse.json(
      { error: "Unable to update profile" },
      { status: 500 },
    );
  }
}
