import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    where: { bookingStatus: 'REQUESTED' },
    include: { chcService: true }
  });

  const updated = [];
  for (const booking of bookings) {
    const basePrice = booking.area * booking.chcService.price;
    const finalAmount = basePrice + 200;

    const res = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        vpBasePrice: basePrice,
        vpFinalAmount: finalAmount,
        vpProposedAt: new Date(),
        additionalCharges: {
          create: [
            { reason: "Simulated Travel Fee", amount: 200 }
          ]
        }
      }
    });
    updated.push(res.id);
  }

  return NextResponse.json({ success: true, message: `Simulated proposals for ${updated.length} bookings`, updated });
}
