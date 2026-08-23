import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";

async function getCHCSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { role?: string; profileId?: string }
    | undefined;
  if (!user || user.role !== "chc" || !user.profileId) return null;
  return user as { role: string; profileId: string };
}

export async function GET() {
  const user = await getCHCSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { chcId: user.profileId },
    include: {
      farmer: true,
      chcService: { include: { service: true } },
      assignedDriver: { include: { user: true } },
      additionalCharges: true,
      payment: true,
    },
       orderBy: [{ bookingDate: "asc" }],

  });

  return NextResponse.json({ bookings });
}
