export const dynamic = "force-dynamic";
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

  const rawBookings = await prisma.booking.findMany({
    where: { chcId: user.profileId },
    include: {
      farmer: true,
      chcService: { include: { service: true } },
      assignedDriver: { include: { user: true } },
      additionalCharges: true,
      payment: true,
      chc: { include: { user: true } },
    },
    orderBy: [{ bookingDate: "asc" }],
  });

  const { getRouteDistance } = await import('@/src/lib/geo');

  const bookings = await Promise.all(rawBookings.map(async (b) => {
    let distance = null;
    const farmerLoc = b.farmer.location as any;
    const chcLoc = b.chc.user.location as any;
    
    if (farmerLoc?.lat && chcLoc?.lat) {
      const fLat = farmerLoc.lat;
      const fLon = farmerLoc.lng ?? farmerLoc.lon;
      const cLat = chcLoc.lat;
      const cLon = chcLoc.lng ?? chcLoc.lon;
      if (fLat && fLon && cLat && cLon) {
        distance = await getRouteDistance(fLat, fLon, cLat, cLon);
      }
    }
    
    return { ...b, distance };
  }));

  return NextResponse.json({ bookings });
}
