import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/src/lib/pusherServer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, lat, lon } = body;

    if (!bookingId || lat === undefined || lon === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Emit the location to the specific booking channel
    // Both Farmer and CHC dashboards looking at this map will subscribe to this channel
    await pusherServer.trigger(`booking-${bookingId}`, 'location-update', {
      lat,
      lon,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Location update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
