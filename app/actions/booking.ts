"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function createBookingRequest(data: {
  chcServiceId: string;
  chcId: string;
  bookingDate: Date;
  area: number;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const farmer = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!farmer || farmer.role !== "farmer") {
      return { success: false, error: "Only farmers can book services." };
    }

    const booking = await prisma.booking.create({
      data: {
        farmerId: farmer.id,
        chcServiceId: data.chcServiceId,
        chcId: data.chcId,
        bookingDate: new Date(data.bookingDate), // Ensure it's a date object
        area: data.area,
        bookingStatus: "REQUESTED",
      },
    });

    revalidatePath("/dashboard/farmer");
    revalidatePath("/chc/services");
    
    return { success: true, bookingId: booking.id };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to submit booking request." };
  }
}
